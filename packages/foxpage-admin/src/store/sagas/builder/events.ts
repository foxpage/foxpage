import _ from 'lodash';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/events';
import * as MAIN_ACTIONS from '@/actions/builder/main';
import { BuilderContentActionType } from '@/reducers/builder/main';
import { store } from '@/store/index';
import {
  Application,
  DndData,
  FormattedData,
  PageContent,
  RenderStructureNode,
  StructureNode,
  VariableEntity,
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
    newPageContent = _.cloneDeep({ ...pageContent, content: newContent });
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
    });
    return { formattedData: newFormatted, pageContent: newPageContent };
  }

  return { formattedData, pageContent };
}

function* handleAfterUpdate(actions: BuilderContentActionType) {
  const { pageContent, formattedData } = actions.payload as UpdateData;
  // current only variables need to match
  const cachedVariables = store.getState().applications.detail.file.variables.list || [];
  const localVariables = store.getState().builder.main.localVariables;
  const { variables = [], ...rest } = pageContent.relations || {};
  const relations = {
    ...rest,
    variables: localVariables.concat(variables as VariableEntity[]).concat(cachedVariables),
  };

  // init & check relation (current only variables)
  const result = yield call(getRelation, pageContent.content, relations);
  const newPageContent = { ...pageContent, content: { ...pageContent.content, relation: result.relation } };
  yield put(MAIN_ACTIONS.pushLocalVariables(result.data.variables));

  yield put(MAIN_ACTIONS.pushStep(newPageContent));
  yield put(MAIN_ACTIONS.updateContent(newPageContent));
  yield put(MAIN_ACTIONS.pushFormatData(formattedData));
}

function* handleDropComponent(actions: BuilderContentActionType) {
  const { params } = actions.payload as { params: DndData };
  const { formattedData, file } = store.getState().builder.main;
  const effects = dropComponent(params, {
    formattedData,
    file,
  });
  yield put(MAIN_ACTIONS.selectComponent(effects[0] as RenderStructureNode));
  const result: UpdateData = yield call(doUpdate, effects, formattedData);
  yield put(ACTIONS.afterUpdateComponent(result.pageContent, result.formattedData));
}

function* handleCopyComponent(actions: BuilderContentActionType) {
  const { params } = actions.payload as { params: RenderStructureNode };
  const { formattedData } = store.getState().builder.main;
  const effects = copyComponents([params], { formattedData });
  yield put(MAIN_ACTIONS.selectComponent(effects[0]));
  const result: UpdateData = yield call(doUpdate, effects, formattedData);
  yield put(ACTIONS.afterUpdateComponent(result.pageContent, result.formattedData));
}

function* handleRemoveComponent(actions: BuilderContentActionType) {
  const { params } = actions.payload as { params: RenderStructureNode };
  const { formattedData, content } = store.getState().builder.main;
  const { updates = [], formattedData: formatted } = removeComponents([params], {
    content,
    formattedData,
  });
  const result: UpdateData = yield call(doUpdate, updates, formatted);
  yield put(MAIN_ACTIONS.selectComponent(null));
  yield put(ACTIONS.afterUpdateComponent(result.pageContent, result.formattedData));
}

function* handleUpdateComponent(actions: BuilderContentActionType) {
  const { params } = actions.payload as { params: RenderStructureNode };
  // TODO:
  // component or page node
  if (params.name === 'page' && params.type === 'page') {
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
      // is mock update
      const { pageContent, mock } = store.getState().builder.main;
      const newContent = { ...mock, schemas: updateMockContent([params], mock) };
      yield put(MAIN_ACTIONS.updateMock(newContent));
      const result: UpdateData = yield call(doUpdate, [params], formattedData, () => {
        return _.cloneDeep({ ...pageContent, mock: newContent });
      });
      yield put(ACTIONS.afterUpdateComponent(result.pageContent, result.formattedData));
    }
  }
}

function* handleVariableBind(actions: BuilderContentActionType) {
  const { keys, value } = actions.payload as { keys: string; value: string };
  const { selectedNode } = store.getState().builder.main;

  if (selectedNode) {
    const clonedProps = selectedNode.props || {};
    const keyPath: string[] = keys.split('.') || [];
    const key = keyPath.pop() as string;
    let finalProps = keyPath.reduce((a: any, c: string) => {
      if (typeof a[c] !== 'undefined') return a[c];
      a[c] = {};
      return a[c];
    }, clonedProps);
    finalProps = { ...finalProps, [key]: value };

    yield put(ACTIONS.updateComponent({ ...selectedNode, props: finalProps }));
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
