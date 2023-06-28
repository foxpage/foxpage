import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as API from '@/apis/record';
import { RecordActionType } from '@/constants/index';
import { getBusinessI18n } from '@/foxI18n/index';
import * as RECYCLE_BIN_ACTIONS from '@/store/actions/builder/recyclebin';
import * as ACTIONS from '@/store/actions/record';
import { store } from '@/store/index';
import { ComponentsActionType } from '@/store/reducers/builder/component';
import { RecordFetchEdRes, RecordFetchParams, RecordSaveParams, RecordStatusFetchEdRes } from '@/types/index';
import { errorToast } from '@/utils/error-toast';

import { cacheLogs, clearCacheLogs } from '../builder/services';

import { initRecordLog } from './service';

function* handleAddRecords(action: ComponentsActionType) {
  const {
    action: actionType,
    details,
    opt,
  } = action.payload as {
    action: RecordActionType;
    details: any[];
    opt?: {
      save?: boolean;
      applicationId?: string;
      contentId?: string;
    };
  };
  if (!details?.length) return;
  const { nodeUpdateIndex, nodeUpdateRecords } = store.getState().record.main;
  const { save = false, applicationId = '', contentId = '' } = opt || {};
  const newLog = initRecordLog(actionType, details);
  const updateIndex = actionType === RecordActionType.PAGE_PRE_STEP ? nodeUpdateIndex - 1 : nodeUpdateIndex + 1;
  yield put(ACTIONS.updateNodeUpdateRecordsIndex(updateIndex));
  // prev step and next step just change stack index
  if (![RecordActionType.PAGE_PRE_STEP, RecordActionType.PAGE_NEXT_STEP].includes(actionType)) {
    const updateCloned = nodeUpdateRecords.slice(0, updateIndex + 1);
    updateCloned.push(newLog);
    yield put(ACTIONS.updateNodeUpdateRecords(updateCloned));
  } else {
    yield put(RECYCLE_BIN_ACTIONS.diffRecords());
  }
  if (save) {
    yield put(ACTIONS.saveUserRecords({ applicationId, contentId, logs: [newLog] }));
  } else {
    yield put(ACTIONS.updateLocalRecords([newLog]));
    const { pageContent } = store.getState().builder.main || {};
    if (pageContent?.contentId) {
      const { localRecords = [] } = store.getState().record.main;
      cacheLogs(pageContent?.contentId, localRecords);
    }
  }
}

function* handleSaveRecords(action: ComponentsActionType) {
  const { params } = action.payload as { params: RecordSaveParams };
  const { localRecords = [], pageNum } = store.getState().record.main;
  let records = params.logs || [];
  if (records.length === 0) {
    records = localRecords;
  }
  const {
    global: { saveFailed },
  } = getBusinessI18n();
  if (params.contentId && records.length > 0) {
    params.logs = records;
    const res: RecordFetchEdRes = yield call(API.addRecords, params);

    if (res.code === 200) {
      const { pageContent } = store.getState().builder.main;
      const fetchParams = {
        applicationId: params.applicationId,
        contentId: pageContent.contentId,
      };
      yield all([
        put(ACTIONS.updatePageNum(1)),
        pageNum === 1 && put(ACTIONS.fetchUserRecords(fetchParams)),
        put(ACTIONS.fetchUserRecordStatus(fetchParams)),
        put(ACTIONS.clearLocalRecord()),
      ]);
      clearCacheLogs(pageContent.contentId);
    } else {
      errorToast(res, saveFailed);
    }
  }
}

function* handleFetchRecords(action: ComponentsActionType) {
  const { params } = action.payload as { params: RecordFetchParams };
  const res: RecordFetchEdRes = yield call(API.fetchRecords, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushUserRecords(res));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }
}

function* handleFetchUserRecordStatus(action: ComponentsActionType) {
  const { params } = action.payload as { params: RecordFetchParams };
  const res: RecordStatusFetchEdRes = yield call(API.fetchRecordStatus, params);

  if (res.code === 200) {
    const data = {
      page: {},
      structure: {},
      variable: {},
      condition: {},
      function: {},
    };
    Object.keys(res.data).forEach((key) => {
      res.data[key]?.forEach((item) => {
        data[key][item] = true;
      });
    });
    yield put(ACTIONS.pushUserRecordStatus(data));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.addUserRecords), handleAddRecords);
  yield takeLatest(getType(ACTIONS.saveUserRecords), handleSaveRecords);
  yield takeLatest(getType(ACTIONS.fetchUserRecords), handleFetchRecords);
  yield takeLatest(getType(ACTIONS.fetchUserRecordStatus), handleFetchUserRecordStatus);
}

export default function* rootSaga() {
  yield all([watch()]);
}
