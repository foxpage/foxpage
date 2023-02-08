import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as API from '@/apis/history';
import { getBusinessI18n } from '@/foxI18n/index';
import { store } from '@/store/index';
import { ContentVersionRes, ContentVersionsParams, HistoryFetchParams } from '@/types/index';
import { errorToast } from '@/utils/index';

import * as ACTIONS from '../../actions/history';

function* handleHistoryInit(action) {
  const { listIndex } = store.getState().history.main;
  const { params, versionId } = action.payload as { params: ContentVersionsParams; versionId?: string };
  const res: ContentVersionRes = yield call(API.getAllContentVersions, params);
  if (res.code === 200) {
    yield put(ACTIONS.updateVersionsList(res.data));
    if (res.data.length > listIndex) {
      const version = versionId ? res.data.find((item) => item.id === versionId) : res.data[listIndex];
      const vId = versionId ? versionId : res.data[listIndex].id;
      yield call(handleFetchHistories, {
        payload: {
          params: { applicationId: params.applicationId, contentId: params.id, versionId: vId },
          version,
        },
      });
    }
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, res.msg || fetchListFailed);
  }
}

function* handleFetchHistories(action) {
  yield put(ACTIONS.updateLoading(true));
  const { params, version } = action.payload as { params: HistoryFetchParams; version: any };
  const res = yield call(API.fetchHistory, params);
  if (res.code === 200) {
    yield put(
      ACTIONS.pushHistories({
        histories: res.data,
        version: version.version,
      }),
    );

    yield put(ACTIONS.updateLoading(false));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, res.msg || fetchListFailed);
    yield put(ACTIONS.updateLoading(false));
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.initHistory), handleHistoryInit);
  yield takeLatest(getType(ACTIONS.fetchHistoriesByVersion), handleFetchHistories);
}

export default function* rootSaga() {
  yield all([watch()]);
}
