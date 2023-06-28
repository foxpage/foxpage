import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/dynamics/index';
import * as API from '@/apis/workspace/index';
import { getBusinessI18n } from '@/foxI18n/index';
import { DynamicActionType } from '@/reducers/workspace/dynamics/list';
import { DynamicFetchParams } from '@/types/index';
import { errorToast } from '@/utils/error-toast';

function* handleFetchDynamics(action: DynamicActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params } = action.payload as { params: DynamicFetchParams };
  const res = yield call(API.searchDynamics, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushDynamics(res.data, res.pageInfo));
  } else {
    const {
      global: { searchFailed },
    } = getBusinessI18n();

    errorToast(res, searchFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchDynamics), handleFetchDynamics);
}

export default function* rootSaga() {
  yield all([watch()]);
}
