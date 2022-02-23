import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/recycles';
import * as API from '@/apis/workspace/projects';
import { getBusinessI18n } from '@/pages/locale';
import { RecycleActionType } from '@/reducers/workspace/recycles';
import { PaginationReqParams } from '@/types/common';

function* handleSearchRecycles(action: RecycleActionType) {
  const { page, search, size } = action.payload as PaginationReqParams;
  yield put(ACTIONS.updateLoading(true));
  const {
    global: { searchFailed },
  } = getBusinessI18n();
  const res = yield call(API.searchRecycles, { page, search, size });
  if (res.code === 200) {
    yield put(ACTIONS.pushRecycles(res.data, res.pageInfo));
  } else {
    message.error(res.msg || searchFailed);
  }
  yield put(ACTIONS.updateLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.searchRecycles), handleSearchRecycles);
}

export default function* rootSaga() {
  yield all([watch()]);
}
