import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/dynamics/dynamics';
import * as API from '@/apis/workspace/projects';
import { getBusinessI18n } from '@/pages/locale';
import { DynamicActionType } from '@/reducers/workspace/dynamics/dynamics';
import { DynamicFetchParams } from '@/types/workspace';

function* handleSearchDynamics(action: DynamicActionType) {
  const { params } = action.payload as { params: DynamicFetchParams };
  yield put(ACTIONS.updateLoading(true));
  const {
    global: { searchFailed },
  } = getBusinessI18n();
  const res = yield call(API.searchDynamics, params);
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
