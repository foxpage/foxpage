import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/events';
import * as MAIN_ACTIONS from '@/actions/builder/main';
import * as RECYCLE_BIN_ACTIONS from '@/actions/builder/recyclebin';
import { RecordActionType } from '@/constants/record';
import { getBusinessI18n } from '@/foxI18n/index';
import * as RECORD_ACTIONS from '@/store/actions/record';
import { store } from '@/store/index';
import { BuilderContentActionType } from '@/store/reducers/builder/main';
import {
  PageContent,
  StructureNode,
} from '@/types/index';

import { getPageContent, inPlacement } from './events/index';
import { findStructureById } from './utils';

function* handlePushBack(actions: BuilderContentActionType) {
  const { nodes } = actions.payload as { nodes: StructureNode[] };
  const {
    recyclebin: { nodeExistError },
  } = getBusinessI18n();
  const {
    formattedData,
    pageContent: oldContent,
    readOnly = false,
    pageNode: rootNode,
  } = store.getState().builder.main;
  if (readOnly) {
    return;
  }
  const effects = nodes.map((el) => {
    const parentId = el.extension?.parentId;
    const nodeExist = !!findStructureById(formattedData.formattedSchemas, el.id);
    if (nodeExist) {
      message.warn(nodeExistError);
      return null;
    }
    const parentExist = parentId && !!findStructureById(formattedData.formattedSchemas, parentId);
    // set parent to rootNode if parent node not exist
    if (!parentExist && rootNode) {
      return inPlacement(el, rootNode, formattedData)[0];
    }
    // if exist return
    return el;
  });
  function* future() {
    const finalEffects = effects.filter(el => !!el) as StructureNode[];
    // get new page content & update to store
    const pageContent: PageContent = yield call(getPageContent, finalEffects, formattedData, {
      ignoreRelationBind: true,
    });
    yield put(MAIN_ACTIONS.updateContent(pageContent));
    yield put(RECORD_ACTIONS.addUserRecords(RecordActionType.STRUCTURE_RECOVER, finalEffects));
    yield put(ACTIONS.forReRender(pageContent, oldContent));
  }
  yield put(MAIN_ACTIONS.guard(future));
}

// get deleted nodes from record log
function* handleDiffRecords() {
  const { nodeUpdateRecords = [], nodeUpdateIndex } = store.getState().record.main;
  const activatedUpdate = nodeUpdateRecords.slice(0, nodeUpdateIndex + 1);
  const targetRecords = activatedUpdate.filter((record) =>
    [RecordActionType.STRUCTURE_REMOVE, RecordActionType.STRUCTURE_RECOVER].includes(record.action),
  );
  const countMap = new Map();
  const recordMap = new Map();
  targetRecords.map((record) => {
    const nodeId = record.content[0].id;
    countMap.set(nodeId, (countMap.get(nodeId) || 0) + 1);
    if (!recordMap.get(nodeId)) {
      recordMap.set(nodeId, record);
    }
  });
  const removedIds = Array.from(countMap.keys()).filter(key => countMap.get(key) & 1);
  const removedLogs = removedIds.map(id => recordMap.get(id));
  yield put(RECYCLE_BIN_ACTIONS.setList(removedLogs, removedLogs.length, false));
}

function* watch() {
  yield takeLatest(getType(RECYCLE_BIN_ACTIONS.pushBackNodes), handlePushBack);
  yield takeLatest(getType(RECYCLE_BIN_ACTIONS.diffRecords), handleDiffRecords);
}

export default function* rootSaga() {
  yield all([watch()]);
}
