import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/dynamics';
import * as API from '@/apis/workspace/projects';
import { getBusinessI18n } from '@/pages/locale';
import { DynamicActionType } from '@/reducers/workspace/dynamics';
import { PaginationReqParams } from '@/types/common';

function* handleSearchDynamics(action: DynamicActionType) {
  const { page, search, size } = action.payload as PaginationReqParams;
  yield put(ACTIONS.updateLoading(true));
  const {
    global: { searchFailed },
  } = getBusinessI18n();
  const res = yield call(API.searchDynamics, { page, search, size });
  if (res.code === 200) {
    yield put(ACTIONS.pushDynamics(res.data, res.pageInfo));
  } else {
    message.error(res.msg || searchFailed);
  }
  yield put(ACTIONS.updateLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.searchDynamics), handleSearchDynamics);
}

export default function* rootSaga() {
  yield all([watch()]);
}
