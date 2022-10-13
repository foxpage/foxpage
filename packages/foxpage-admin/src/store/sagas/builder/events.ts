import _ from 'lodash';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/events';
import * as MAIN_ACTIONS from '@/actions/builder/main';
import { ComponentType, PAGE_COMPONENT_NAME } from '@/constants/index';
import { BuilderContentActionType } from '@/reducers/builder/main';
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

import {
  copyComponents,
  dropComponent,
  isNode,
  removeComponents,
  updateContent,
  updateMockContent,
} from './events/index';
import { getRelation, initState } from './services';
import { getConditionRelationKey, pickNode } from './utils';

type UpdateData = {
  pageContent: PageContent;
  formattedData: FormattedData;
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
 * @param hook
 * @returns
 */
async function doUpdate(
  effects: StructureNode[] = [],
  formattedData: FormattedData,
  hook?: () => PageContent,
) {
  let newPageContent = null as PageContent | null;
  const { pageContent, application, extend } = store.getState().builder.main;

  if (!hook) {
    const content = store.getState().builder.main.content;
    const result = updateContent(effects, formattedData);
    const newContent = { ...content, schemas: result };
    const relations = handleGetLocalRelations(pageContent.relations);
    const relationalResult = await getRelation(newContent, relations);
    newPageContent = _.cloneDeep({
      ...pageContent,
      content: {
        ...newContent,
        relation: relationalResult.relation,
      },
      relations: { ...relations, variables: relations.variables?.concat(relationalResult.data.variables) },
    });
  } else {
    newPageContent = hook();
  }

  if (newPageContent) {
    const newFormatted = await initState(newPageContent, {
      application: application as Application,
      locale: store.getState().builder.header.locale,
      components: store.getState().builder.component.components,
      extendPage: _.cloneDeep(extend),
      file: store.getState().builder.main.file,
      rootNode: store.getState().builder.main.pageNode as StructureNode,
    });

    return { formattedData: newFormatted, pageContent: newPageContent };
  }

  return { formattedData, pageContent };
}

function* handleAfterUpdate(actions: BuilderContentActionType) {
  const { pageContent, formattedData } = actions.payload as UpdateData;
  // const relations = handleGetLocalRelations(pageContent.relations);
  // // init & check relation (current only variables)
  // const result = yield call(getRelation, pageContent.content, relations);
  // const newPageContent = { ...pageContent, content: { ...pageContent.content, relation: result.relation } };
  // yield put(MAIN_ACTIONS.pushLocalVariables(result.data.variables));

  yield put(MAIN_ACTIONS.pushStep(pageContent));
  yield put(MAIN_ACTIONS.updateContent(pageContent));
  yield put(MAIN_ACTIONS.pushFormatData(formattedData));
}

function* handleDropComponent(actions: BuilderContentActionType) {
  const { params } = actions.payload as { params: DndData };
  const { formattedData, file } = store.getState().builder.main;
  const effects = dropComponent(params, {
    formattedData,
    file,
  });
  const result: UpdateData = yield call(doUpdate, effects, formattedData);
  yield put(ACTIONS.afterUpdateComponent(result.pageContent, result.formattedData));
  yield put(MAIN_ACTIONS.selectComponent(effects[0] as RenderStructureNode));
}

function* handleCopyComponent(actions: BuilderContentActionType) {
  const { params } = actions.payload as { params: RenderStructureNode };
  const { formattedData } = store.getState().builder.main;
  const effects = copyComponents([params], { formattedData });
  const result: UpdateData = yield call(doUpdate, effects, formattedData);
  yield put(ACTIONS.afterUpdateComponent(result.pageContent, result.formattedData));
  yield put(MAIN_ACTIONS.selectComponent(effects[0]));
}

function* handleRemoveComponent(actions: BuilderContentActionType) {
  const { params } = actions.payload as { params: RenderStructureNode };
  const { formattedData, content } = store.getState().builder.main;
  const { updates = [], formattedData: formatted } = removeComponents([params], {
    content,
    formattedData,
  });
  const result: UpdateData = yield call(doUpdate, updates, formatted);
  yield put(ACTIONS.afterUpdateComponent(result.pageContent, result.formattedData));
  yield put(MAIN_ACTIONS.selectComponent(null));
}

function* handleUpdateComponent(actions: BuilderContentActionType) {
  const { params } = actions.payload as { params: RenderStructureNode };
  // TODO:
  // component or page node
  if (params.name === PAGE_COMPONENT_NAME && params.type === ComponentType.dslTemplate) {
    yield put(MAIN_ACTIONS.updatePageNode({ ...pickNode(params), children: [] }));
    const { pageContent, formattedData } = store.getState().builder.main;
    yield put(ACTIONS.afterUpdateComponent(pageContent, formattedData));
  } else {
    const { formattedData } = store.getState().builder.main;
    yield put(MAIN_ACTIONS.selectComponent(params));

    const _isNode = isNode(params);
    if (_isNode) {
      const result: UpdateData = yield call(doUpdate, [params], formattedData);
      yield put(ACTIONS.afterUpdateComponent(result.pageContent, result.formattedData));
    } else {
      const { pageContent, mock } = store.getState().builder.main;
      let newContent = {
        ...mock,
        schemas: updateMockContent([params], mock),
      };
      // init & check relation (current only variables)
      const relations = handleGetLocalRelations({});
      const content = (newContent as unknown) as Content;
      const relationalResult = yield call(getRelation, content, relations);
      yield put(MAIN_ACTIONS.pushLocalVariables(relationalResult.data.variables));

      newContent = {
        ...newContent,
        relation: relationalResult.relation,
      };

      yield put(MAIN_ACTIONS.updateMock(newContent));
      // @TODO: need to lint
      const result: UpdateData = yield call(doUpdate, [params], formattedData, () => {
        return _.cloneDeep({
          ...pageContent,
          mock: newContent,
          relations: {
            ...pageContent.relations,
            variables: (pageContent.relations.variables || []).concat(relationalResult.data.variables),
          },
        });
      });

      yield put(ACTIONS.afterUpdateComponent(result.pageContent, result.formattedData));
    }
  }
}

function* handleVariableBind(actions: BuilderContentActionType) {
  const { keys, value, opt } = actions.payload as { keys: string; value: string; opt?: { isMock } };
  const { selectedNode } = store.getState().builder.main;

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

    yield put(ACTIONS.updateComponent({ ..._newSelectNode, props: finalProps }));
  }
}

function* handleConditionBind(actions: BuilderContentActionType) {
  const { conditionIds } = actions.payload as { conditionIds: string[] };
  const { selectedNode } = store.getState().builder.main;

  if (selectedNode) {
    const { directive = {} } = selectedNode;
    const ifs = conditionIds.map((item) => `{{${getConditionRelationKey(item)}}}`);
    const newDirective = { ...directive, if: ifs };

    yield put(ACTIONS.updateComponent({ ...selectedNode, directive: newDirective }));
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.dropComponent), handleDropComponent);
  yield takeLatest(getType(ACTIONS.copyComponent), handleCopyComponent);
  yield takeLatest(getType(ACTIONS.removeComponent), handleRemoveComponent);
  yield takeLatest(getType(ACTIONS.updateComponent), handleUpdateComponent);
  yield takeLatest(getType(ACTIONS.afterUpdateComponent), handleAfterUpdate);
  yield takeLatest(getType(ACTIONS.variableBind), handleVariableBind);
  yield takeLatest(getType(ACTIONS.conditionBind), handleConditionBind);
}

export default function* rootSaga() {
  yield all([watch()]);
}
