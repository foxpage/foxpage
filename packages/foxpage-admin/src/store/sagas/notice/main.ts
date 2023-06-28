import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as API from '@/apis/notice';
import * as ACTIONS from '@/store/actions/notice';
import { Notice, NoticeFetchedResponse } from '@/types/index';

function* handleFetchNotices() {
  const res: NoticeFetchedResponse = yield call(API.fetchNotices, {});

  if (res.code === 200) {
    yield put(ACTIONS.pushNotices((res.data || []) as Notice[]));
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchNotices), handleFetchNotices);
}

export default function* rootSaga() {
  yield all([watch()]);
}
