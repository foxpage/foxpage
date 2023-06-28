import { message } from 'antd';
import _ from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/events';
import * as MAIN_ACTIONS from '@/actions/builder/main';
import { updateLastModified } from '@/actions/builder/main';
import * as RECYCLE_BIN_ACTIONS from '@/actions/builder/recyclebin';
import { addCondition, fetchConditionDetail } from '@/apis/application';
import { copyStructure } from '@/apis/builder/content';
import { ComponentType, PAGE_COMPONENT_NAME, RecordActionType, RightClickPasteType } from '@/constants/index';
import { getBusinessI18n } from '@/foxI18n/index';
import { BuilderContentActionType } from '@/reducers/builder/main';
import * as RECORD_ACTIONS from '@/store/actions/record';
import { store } from '@/store/index';
import {
  Application,
  Content,
  CopyOptions,
  DndData,
  InitStateParams,
  PageContent,
  PasteOptions,
  RenderStructureNode,
  StructureCopyRes,
  StructureNode,
  UpdateOptions,
} from '@/types/index';
import { errorToast } from '@/utils/error-toast';
import shortId from '@/utils/short-id';

import {
  copyComponents,
  dropComponent,
  getPageContent,
  handleGetLocalRelations,
  ignoreRelationParse,
  initCopyData,
  initPasteData,
  isNode,
  removeComponents,
  updateMockContent } from './events/index';
import { copyToClipboard, getDataFromClipboard, getRelation, initState } from './services';
import { getConditionRelationKey, pickNode, treeToList } from './utils';

function* handleForRender(actions: BuilderContentActionType) {
  const { pageContent, oldPageContent } = actions.payload as {
    pageContent: PageContent;
    oldPageContent?: PageContent;
  };
  const { application, extend } = store.getState().builder.main;
  const initParams = {
    application: application as Application,
    locale: store.getState().builder.header.locale,
    components: store.getState().builder.component.components,
    extendPage: cloneDeep(extend),
    file: store.getState().builder.main.file,
    rootNode: store.getState().builder.main.pageNode as StructureNode,
    parseInLocal: true,
  } as InitStateParams;
  const formatted = yield call(initState, pageContent, initParams);
  yield put(MAIN_ACTIONS.pushFormatData(formatted));
  yield put(MAIN_ACTIONS.pushStep(pageContent, 0, oldPageContent));
  yield put(MAIN_ACTIONS.prasePageInServer(pageContent, initParams));
}

function* handleDropComponent(actions: BuilderContentActionType) {
  const { params } = actions.payload as { params: DndData };
  const { formattedData, file, pageContent: oldContent, readOnly = false } = store.getState().builder.main;
  if (readOnly) {
    return;
  }
  function* future() {
    const { adds = [], effects = [] } = dropComponent(params, {
      formattedData,
      file,
    });
    const isMove = params.dragInfo?.type === 'move';
    // get new page content & update to store
    const pageContent: PageContent = yield call(getPageContent, effects, formattedData, {
      // ignoreRelationBind: params.dragInfo?.detail.type !== 'block' && (isMove || ignoreRelationParse(params)),
      ignoreRelationBind: isMove || ignoreRelationParse(params),
    });
    yield put(MAIN_ACTIONS.updateContent(pageContent));
    // record
    if (isMove) {
      yield put(RECORD_ACTIONS.addUserRecords(RecordActionType.STRUCTURE_MOVE, [effects[0]]));
    } else {
      const newList = [];
      treeToList(adds, newList);
      yield put(RECORD_ACTIONS.addUserRecords(RecordActionType.STRUCTURE_CREATE, newList));
    }
    yield put(MAIN_ACTIONS.selectComponent(effects[0] as RenderStructureNode, { from: 'sider' }));
    yield put(ACTIONS.forReRender(pageContent, oldContent));
  }
  yield put(MAIN_ACTIONS.guard(future));
}

function* handleConditionCheckBeforeCopy(applicationId: string, ids: string[]) {
  let conditionPromise: any = [];

  for (let i = 0; i < ids?.length; i++) {
    const res = yield call(fetchConditionDetail, { applicationId, id: ids[i] });
    conditionPromise.push(res.data);
  }

  return conditionPromise;
}

function* handleConditionGenerateBeforeCopy(applicationId, folderId, content: any) {
  const name = `__renderConditionTimeAndDisplay_${shortId(10)}`;
  const params = {
    applicationId,
    folderId,
    content: {
      id: content.id,
      relation: content.relation,
      schemas: [
        {
          children: content.schemas?.[0].children,
          name,
          props: content.schemas?.[0].props,
          type: content.schemas?.[0].type,
        },
      ],
    },
    name,
    subType: 'timeDisplay',
  };
  const res = yield call(addCondition, params);

  return res.data?.contentId || '';
}

function batchUpdate(data?: UpdateOptions) {
  const { formattedData, content, file } = store.getState().builder.main;
  if (!data) {
    return { effects: [], formattedData };
  }
  let effects: StructureNode[] = [];
  let formatted = formattedData;
  const { adds = [], updates = [], removes = [] } = data;
  // new
  if (adds.length > 0) {
    adds.forEach((detail) => {
      const { effects: result = [] } = dropComponent(detail, {
        formattedData,
        file,
      });
      effects = effects.concat(result);
    });
  }
  // update
  if (updates.length > 0) {
    effects = effects.concat(updates);
  }
  // remove
  if (removes.length > 0) {
    const result = removeComponents(removes, {
      content,
      formattedData,
    });
    effects = effects.concat(result.updates);
    formatted = result.formattedData;
  }

  return { effects, formattedData: formatted };
}

function* handleCopyComponent(actions: BuilderContentActionType) {
  const { params, opt } = actions.payload as { params: RenderStructureNode; opt?: UpdateOptions };

  const { application, file, readOnly = false } = store.getState().builder.main;
  if (readOnly) {
    return;
  }
  const applicationId = application?.id || '';
  const folderId = file?.folderId || '';
  const { directive } = params || {};

  // check condition if time condition
  let _params;
  if (directive?.if && directive.if?.length > 0) {
    const conditions = directive.if;
    const conditionIds = conditions.map((item) => item.substring(item.indexOf(':') + 1, item.indexOf('}}')));
    const conditionDetailList = yield handleConditionCheckBeforeCopy(applicationId, conditionIds);
    const timeCondition = conditionDetailList.find((condition) =>
      condition?.content?.schemas?.[0]?.name.startsWith('__renderConditionTimeAndDisplay_'),
    );

    if (!timeCondition) {
      _params = params;
    } else {
      const _conditionId = yield handleConditionGenerateBeforeCopy(
        applicationId,
        folderId,
        timeCondition.content,
      );
      const _conditions = _conditionId
        ? conditions.map((condition) =>
            condition.indexOf(timeCondition.contentId) > -1 ? `{{__conditions:${_conditionId}}}` : condition,
          )
        : conditions;

      _params = {
        ...params,
        directive: {
          if: _conditions,
        },
      };
    }
  } else {
    _params = params;
  }

  const { formattedData, pageContent: oldContent } = store.getState().builder.main;
  function* future() {
    const effects = copyComponents([_params], { formattedData });
    // update batch
    const { effects: batchEffects, formattedData: batchFormattedData } = batchUpdate(opt);
    // get new page content & update to store
    const pageContent: PageContent = yield call(
      getPageContent,
      effects.concat(batchEffects),
      batchFormattedData,
      {
        ignoreRelationBind: ignoreRelationParse(_params),
      },
    );
    yield put(MAIN_ACTIONS.updateContent(pageContent));
    const newList = [];
    treeToList([effects[0]], newList);
    yield put(RECORD_ACTIONS.addUserRecords(RecordActionType.STRUCTURE_CREATE, newList));
    yield put(MAIN_ACTIONS.selectComponent(effects[0], { from: 'sider' }));
    yield put(ACTIONS.forReRender(pageContent, oldContent));
  }
  yield put(MAIN_ACTIONS.guard(future));
}

function* handleRemoveComponent(actions: BuilderContentActionType) {
  const { params, opt } = actions.payload as { params: RenderStructureNode; opt?: UpdateOptions };
  const { pageContent: oldContent, readOnly = false } = store.getState().builder.main;
  if (readOnly) {
    return;
  }

  function* future() {
    // const {
    //   removes = [],
    //   updates = [],
    //   formattedData: formatted,
    // } = removeComponents([params], {
    //   content,
    //   formattedData,
    // });
    const removes = [...(opt?.removes || []), params];
    const _opt = {
      ...opt,
      removes,
    };
    // update batch
    const { effects, formattedData: formatted } = batchUpdate(_opt);
    // get new page content & update to store
    const pageContent: PageContent = yield call(getPageContent, effects, formatted, {
      ignoreRelationBind: ignoreRelationParse(params),
    });
    yield put(MAIN_ACTIONS.updateContent(pageContent));
    yield put(RECORD_ACTIONS.addUserRecords(RecordActionType.STRUCTURE_REMOVE, removes));
    yield put(RECYCLE_BIN_ACTIONS.doDelete(removes));
    if (effects.length > 0) {
      yield put(RECORD_ACTIONS.addUserRecords(RecordActionType.STRUCTURE_UPDATE_BATCH, effects));
    }
    yield put(MAIN_ACTIONS.selectComponent(null, { from: null }));
    yield put(ACTIONS.forReRender(pageContent, oldContent));
  }
  yield put(MAIN_ACTIONS.guard(future));
}

function* handleUpdateComponent(actions: BuilderContentActionType) {
  const { params, opt } = actions.payload as {
    params: RenderStructureNode;
    opt?: { ignoreSelectNodeUpdate: boolean } & UpdateOptions;
  };
  const { ignoreSelectNodeUpdate = true, ...optRest } = opt || {};
  const {
    application,
    pageContent,
    formattedData,
    mock,
    selectedNode,
    readOnly = false,
  } = store.getState().builder.main;
  if (readOnly) {
    return;
  }

  function* future() {
    const oldPageContent = cloneDeep(pageContent);

    // component or page node
    if (params.name === PAGE_COMPONENT_NAME && params.type === ComponentType.dslTemplate) {
      const pageNode = { ...pickNode(params), children: [] };
      yield put(MAIN_ACTIONS.updatePageNode(pageNode));

      // init & check relation (current only variables)
      const { schemas = [] } = pageContent.content || {};
      const newSchemas = { ...pageNode, children: schemas[0]?.children || [] };
      let newContent = { ...pageContent.content, schemas: [newSchemas] };
      const relations = handleGetLocalRelations();
      const content = newContent as unknown as Content;
      const relationalResult = yield call(getRelation, content, relations);
      newContent = {
        ...newContent,
        relation: relationalResult.relation,
      };

      const newPageContent = { ...pageContent, content: newContent };
      yield put(MAIN_ACTIONS.updateContent(newPageContent));
      yield put(
        RECORD_ACTIONS.addUserRecords(RecordActionType.STRUCTURE_UPDATE, [pageNode], {
          applicationId: application?.id,
          contentId: newContent.id,
          save: false,
        }),
      );
      yield put(ACTIONS.forReRender(newPageContent, oldPageContent));
      yield put(MAIN_ACTIONS.pushLocalVariables(relationalResult.data.variables));
    } else {
      const _isNode = isNode(params);

      if (selectedNode?.id === params.id || selectedNode?.extension.extendId === params.id) {
        // handle mock props update node structure illegal
        const _selectedNode = _isNode
          ? params
          : {
              ...selectedNode,
              __mock: params,
            };
        yield put(MAIN_ACTIONS.selectComponent(_selectedNode, { from: 'sider' }));
      }

      if (_isNode) {
        // update batch
        const { effects, formattedData: formatted } = batchUpdate(optRest);
        // update node
        const pageContent: PageContent = yield call(
          getPageContent,
          [params as StructureNode].concat(effects),
          formatted,
          {
            ignoreRelationBind: ignoreRelationParse(params),
          },
        );

        yield put(MAIN_ACTIONS.updateContent(pageContent, ignoreSelectNodeUpdate));
        yield put(RECORD_ACTIONS.addUserRecords(RecordActionType.STRUCTURE_UPDATE, [params]));
        yield put(ACTIONS.forReRender(pageContent, oldPageContent));
      } else {
        // update mock node
        let newContent = {
          ...mock,
          schemas: updateMockContent([params], mock),
        };
        // init & check relation (current only variables)
        const relations = handleGetLocalRelations();
        const content = newContent as unknown as Content;
        const relationalResult = yield call(getRelation, content, relations);
        newContent = {
          ...newContent,
          relation: relationalResult.relation,
        };

        yield put(MAIN_ACTIONS.updateMock(newContent));
        // @TODO: need to lint
        const pageContentWithMock: PageContent = yield call(getPageContent, [params], formattedData, {
          ignoreRelationBind: ignoreRelationParse(params),
          hook: () => {
            return cloneDeep({
              ...pageContent,
              mock: newContent,
              relations: {
                ...pageContent.relations,
                variables: (pageContent?.relations?.variables || []).concat(relationalResult.data.variables),
              },
            });
          },
        });

        yield put(MAIN_ACTIONS.updateContent(pageContentWithMock));
        yield put(ACTIONS.forReRender(pageContentWithMock, oldPageContent));
        yield put(MAIN_ACTIONS.pushLocalVariables(relationalResult.data.variables));

        // add local records for mock
        yield put(
          RECORD_ACTIONS.addUserRecords(RecordActionType.STRUCTURE_UPDATE, [
            {
              ...selectedNode,
              __mock: params,
            },
          ]),
        );
      }
    }
  }
  yield put(MAIN_ACTIONS.guard(future));
}

function* handleVariableBind(actions: BuilderContentActionType) {
  const { keys, value, opt } = actions.payload as { keys: string; value: string; opt?: { isMock } };
  const { selectedNode, readOnly = false } = store.getState().builder.main;
  if (readOnly) {
    return;
  }

  function* future() {
    if (selectedNode) {
      let _newSelectNode = selectedNode;

      // bind mock
      if (opt?.isMock) {
        if (!selectedNode.__mock?.id) {
          _newSelectNode = { id: selectedNode.id, name: selectedNode.name, props: {} } as RenderStructureNode;
        } else {
          _newSelectNode = selectedNode.__mock;
        }
      }

      const clonedProps = _.cloneDeep(_newSelectNode.props || {});
      const keyPath: string[] = keys.split('.') || [];
      const key = keyPath.pop() as string;
      const finalProps = keyPath.reduce((a: any, c: string) => {
        if (typeof a[c] !== 'undefined') return a[c];
        a[c] = {};
        return a[c];
      }, clonedProps);

      if (value === undefined) {
        delete finalProps[key];
      } else {
        finalProps[key] = value;
      }

      yield put(updateLastModified());
      yield put(
        ACTIONS.updateComponent({ ..._newSelectNode, props: clonedProps }, { ignoreSelectNodeUpdate: false }),
      );
    }
  }
  yield put(MAIN_ACTIONS.guard(future));
}

function* handleConditionBind(actions: BuilderContentActionType) {
  const { conditionIds } = actions.payload as { conditionIds: string[] };
  const { selectedNode, readOnly = false } = store.getState().builder.main;
  if (readOnly) {
    return;
  }

  function* future() {
    if (selectedNode) {
      const { directive = {} } = selectedNode;
      const ifs = conditionIds.map((item) => `{{${getConditionRelationKey(item)}}}`);
      const newDirective = { ...directive, if: ifs };

      yield put(
        ACTIONS.updateComponent(
          { ...selectedNode, directive: newDirective },
          { ignoreSelectNodeUpdate: false },
        ),
      );
    }
  }
  yield put(MAIN_ACTIONS.guard(future));
}

function* handleCopyToClipboard(actions: BuilderContentActionType) {
  const { node, opt } = actions.payload as { node: RenderStructureNode; opt: CopyOptions };
  const { formattedData, pageContent, application } = store.getState().builder.main;
  const content = formattedData.mergedContent || pageContent;
  if (content) {
    const result = initCopyData(node, content, opt, application?.id || '');
    yield call(copyToClipboard, result);
    const {
      builder: { copyToClipboard: copyTips },
    } = getBusinessI18n();
    message.info(copyTips);
  }
}

function* handlePasteFromClipboard(actions: BuilderContentActionType) {
  const { node, opt } = actions.payload as { node: RenderStructureNode; opt: PasteOptions };
  const { readOnly = false, application, pageContent } = store.getState().builder.main;
  if (readOnly || !node) {
    return;
  }

  let pasteData: Content['schemas'] | null = null;

  function* paste() {
    if (pasteData) {
      const { type } = opt;
      const dropParams: DndData = {
        placement:
          type === RightClickPasteType.IN ? 'in' : type === RightClickPasteType.BEFORE ? 'before' : 'after',
        dragInfo: { type: 'add', detail: pasteData },
        dropIn: node,
      };
      yield put(ACTIONS.dropComponent(dropParams));
    }
  }

  function* future() {
    let result;
    if (opt.inputData) {
      result = { appId: application?.id, contentId: pageContent.contentId, ...opt.inputData };
    } else {
      result = yield call(getDataFromClipboard);
    }
    const {
      builder: { pasteFailed, pasteEmpty, pasteInvalid },
    } = getBusinessI18n();
    if (result) {
      const { appId, id: contentId, relation, schemas = [] } = result as Content & { appId: string };
      if (appId !== application?.id) {
        message.warn(pasteInvalid);
      } else {
        // no relation or cur content paste
        if (_.isEmpty(relation) || pageContent.contentId === contentId) {
          pasteData = initPasteData(node, result, opt);
          // do paste
          yield call(paste);
        } else {
          const res: StructureCopyRes = yield call(copyStructure, {
            applicationId: application?.id || '',
            contentId: pageContent.contentId,
            relationSchemas: { relation, schemas },
          });
          if (res.code === 200) {
            const { relations, relationSchemas } = res.data || {};
            pasteData = initPasteData(node, relationSchemas as Content, opt);
            // update local relations
            yield put(MAIN_ACTIONS.addRelations(relations));
            // do paste
            yield call(paste);
          } else {
            errorToast(res, pasteFailed);
          }
        }
      }
    } else {
      message.info(pasteEmpty);
    }
  }
  yield put(MAIN_ACTIONS.guard(future));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.forReRender), handleForRender);
  yield takeLatest(getType(ACTIONS.variableBind), handleVariableBind);
  yield takeLatest(getType(ACTIONS.conditionBind), handleConditionBind);
  yield takeLatest(getType(ACTIONS.dropComponent), handleDropComponent);
  yield takeLatest(getType(ACTIONS.copyComponent), handleCopyComponent);
  yield takeLatest(getType(ACTIONS.removeComponent), handleRemoveComponent);
  yield takeLatest(getType(ACTIONS.updateComponent), handleUpdateComponent);
  yield takeLatest(getType(ACTIONS.copyToClipboard), handleCopyToClipboard);
  yield takeLatest(getType(ACTIONS.pasteFromClipboard), handlePasteFromClipboard);
}

export default function* rootSaga() {
  yield all([watch()]);
}
