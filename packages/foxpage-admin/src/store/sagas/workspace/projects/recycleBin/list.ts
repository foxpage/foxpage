import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/recycleBin';
import * as API from '@/apis/workspace';
import { getBusinessI18n } from '@/foxI18n/index';
import { RecycleActionType } from '@/reducers/workspace/projects/recycleBin/list';
import { CommonFetchParams } from '@/types/index';
import { errorToast } from '@/utils/error-toast';

function* handleSearchRecycles(action: RecycleActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params } = action.payload as { params: CommonFetchParams };
  const res = yield call(API.searchRecycles, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushRecycle(res.data, res.pageInfo));
  } else {
    const {
      global: { searchFailed },
    } = getBusinessI18n();

    errorToast(res, searchFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchRecycle), handleSearchRecycles);
}

export default function* rootSaga() {
  yield all([watch()]);
}
