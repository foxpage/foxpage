import cloneDeep from 'lodash/cloneDeep';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/events';
import * as MAIN_ACTIONS from '@/actions/builder/main';
import { updateLastModified } from '@/actions/builder/main';
import { addCondition, fetchConditionDetail } from '@/apis/application';
import { ComponentType, PAGE_COMPONENT_NAME, RecordActionType } from '@/constants/index';
import { BuilderContentActionType } from '@/reducers/builder/main';
import * as RECORD_ACTIONS from '@/store/actions/record';
import { store } from '@/store/index';
import {
  Application,
  Content,
  DndData,
  FormattedData,
  PageContent,
  RelationDetails,
  RenderStructureNode,
  StructureNode,
} from '@/types/index';
import shortId from '@/utils/short-id';

import {
  copyComponents,
  dropComponent,
  isNode,
  removeComponents,
  updateContent,
  updateMockContent,
} from './events/index';
import { getRelation, initState } from './services';
import { getConditionRelationKey, pickNode, treeToList } from './utils';

const ignoreRelationParse = (value: any) => {
  return JSON.stringify(value).indexOf('{{') === -1;
};

function handleGetLocalRelations(relations: RelationDetails = {}) {
  // current only variables need to match
  const localVariables = store.getState().builder.main.localVariables;
  const { variables = [], ...rest } = relations;
  const _relations = {
    ...rest,
    variables: localVariables,
  };
  return _relations;
}

/**
 * do update
 * update content and then init the new state for effect
 * @param effects
 * @param formattedData
 * @param opt
 * @returns
 */
async function getPageContent(
  effects: StructureNode[] = [],
  formattedData: FormattedData,
  opt?: {
    hook?: (() => PageContent) | null;
    ignoreRelationBind?: boolean;
  },
): Promise<PageContent> {
  const { pageContent } = store.getState().builder.main;
  let newPageContent = pageContent;

  if (!opt?.hook) {
    const content = store.getState().builder.main.content;
    const result = updateContent(effects, formattedData);
    const newContent = { ...content, schemas: result };
    const relations = handleGetLocalRelations(pageContent.relations);
    if (!!opt?.ignoreRelationBind) {
      newPageContent = cloneDeep({
        ...pageContent,
        content: {
          ...newContent,
        },
      });
    } else {
      const relationalResult = await getRelation(newContent, relations);
      newPageContent = cloneDeep({
        ...pageContent,
        content: {
          ...newContent,
          relation: relationalResult.relation,
        },
        relations: { ...relations, variables: relations.variables?.concat(relationalResult.data.variables) },
      });
    }
  } else {
    newPageContent = opt.hook();
  }

  return newPageContent;
}

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
  };
  const formatted = yield call(initState, pageContent, initParams);
  yield put(MAIN_ACTIONS.pushFormatData(formatted));
  yield put(MAIN_ACTIONS.pushStep(pageContent, 0, oldPageContent));
  yield put(MAIN_ACTIONS.prasePageInServer(pageContent, initParams));
}

function* handleDropComponent(actions: BuilderContentActionType) {
  const { params } = actions.payload as { params: DndData };
  const { formattedData, file, pageContent: oldContent, readOnly=false } = store.getState().builder.main;
  if (readOnly) {
    return;
  }
  function* future() {
    const effects = dropComponent(params, {
      formattedData,
      file,
    });
    const isMove = params.dragInfo?.type === 'move';
    // get new page content & update to store
    const pageContent: PageContent = yield call(getPageContent, effects, formattedData, {
      ignoreRelationBind: isMove || ignoreRelationParse(params),
    });
    yield put(MAIN_ACTIONS.updateContent(pageContent));
    // record
    if (isMove) {
      yield put(RECORD_ACTIONS.addUserRecords(RecordActionType.STRUCTURE_MOVE, [effects[0]]));
    } else {
      const newList = [];
      treeToList([effects[0]], newList);
      yield put(RECORD_ACTIONS.addUserRecords(RecordActionType.STRUCTURE_CREATE, newList));
    }
    yield put(MAIN_ACTIONS.selectComponent(effects[0] as RenderStructureNode));
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

function* handleCopyComponent(actions: BuilderContentActionType) {
  const { params } = actions.payload as { params: RenderStructureNode };

  // check condition if time condition
  let _params;

  const { application, file, readOnly = false } = store.getState().builder.main;
  if (readOnly) {
    return;
  }
  const applicationId = application?.id || '';
  const folderId = file?.folderId || '';
  const { directive } = params || {};

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
    // get new page content & update to store
    const pageContent: PageContent = yield call(getPageContent, effects, formattedData, {
      ignoreRelationBind: ignoreRelationParse(_params),
    });
    yield put(MAIN_ACTIONS.updateContent(pageContent));
    const newList = [];
    treeToList([effects[0]], newList);
    yield put(RECORD_ACTIONS.addUserRecords(RecordActionType.STRUCTURE_CREATE, newList));
    yield put(MAIN_ACTIONS.selectComponent(effects[0]));
    yield put(ACTIONS.forReRender(pageContent, oldContent));
  }
  yield put(MAIN_ACTIONS.guard(future));
}

function* handleRemoveComponent(actions: BuilderContentActionType) {
  const { params } = actions.payload as { params: RenderStructureNode };
  const { formattedData, content, pageContent: oldContent, readOnly = false } = store.getState().builder.main;
  if (readOnly) {
    return;
  }

  function* future() {
    const {
      removes = [],
      updates = [],
      formattedData: formatted,
    } = removeComponents([params], {
      content,
      formattedData,
    });
    // get new page content & update to store
    const pageContent: PageContent = yield call(getPageContent, updates, formatted, {
      ignoreRelationBind: ignoreRelationParse(params),
    });
    yield put(MAIN_ACTIONS.updateContent(pageContent));
    yield put(RECORD_ACTIONS.addUserRecords(RecordActionType.STRUCTURE_REMOVE, removes));
    if (updates.length > 0) {
      yield put(RECORD_ACTIONS.addUserRecords(RecordActionType.STRUCTURE_UPDATE_BATCH, updates));
    }
    yield put(MAIN_ACTIONS.selectComponent(null));
    yield put(ACTIONS.forReRender(pageContent, oldContent));
  }
  yield put(MAIN_ACTIONS.guard(future));
}

function* handleUpdateComponent(actions: BuilderContentActionType) {
  const { params, opt } = actions.payload as {
    params: RenderStructureNode;
    opt?: { ignoreSelectNodeUpdate: boolean };
  };
  const { ignoreSelectNodeUpdate = true } = opt || {};
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
      const relations = handleGetLocalRelations({});
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
        yield put(MAIN_ACTIONS.selectComponent(_selectedNode));
      }

      if (_isNode) {
        // update node
        const pageContent: PageContent = yield call(getPageContent, [params], formattedData, {
          ignoreRelationBind: ignoreRelationParse(params),
        });

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
        const relations = handleGetLocalRelations({});
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
                variables: (pageContent.relations.variables || []).concat(relationalResult.data.variables),
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

      const clonedProps = _newSelectNode.props || {};
      const keyPath: string[] = keys.split('.') || [];
      const key = keyPath.pop() as string;
      let finalProps = keyPath.reduce((a: any, c: string) => {
        if (typeof a[c] !== 'undefined') return a[c];
        a[c] = {};
        return a[c];
      }, clonedProps);
      finalProps = { ...finalProps, [key]: value };
      yield put(updateLastModified());
      yield put(
        ACTIONS.updateComponent({ ..._newSelectNode, props: finalProps }, { ignoreSelectNodeUpdate: false }),
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

function* watch() {
  yield takeLatest(getType(ACTIONS.forReRender), handleForRender);
  yield takeLatest(getType(ACTIONS.variableBind), handleVariableBind);
  yield takeLatest(getType(ACTIONS.conditionBind), handleConditionBind);
  yield takeLatest(getType(ACTIONS.dropComponent), handleDropComponent);
  yield takeLatest(getType(ACTIONS.copyComponent), handleCopyComponent);
  yield takeLatest(getType(ACTIONS.removeComponent), handleRemoveComponent);
  yield takeLatest(getType(ACTIONS.updateComponent), handleUpdateComponent);
}

export default function* rootSaga() {
  yield all([watch()]);
}
