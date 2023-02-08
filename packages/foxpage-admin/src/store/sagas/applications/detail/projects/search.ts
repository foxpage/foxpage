import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/projects/search';
import * as API from '@/apis/project';
import { getBusinessI18n } from '@/foxI18n/index';
import { ApplicationProjectSearchActionType } from '@/reducers/applications/detail/projects/search';
import { CommonSearchParams } from '@/types/index';
import { errorToast } from '@/utils/error-toast';

function* handleFetchList(action: ApplicationProjectSearchActionType) {
  yield put(ACTIONS.updateLoading(true));

  const {
    organizationId,
    applicationId,
    type,
    typeId,
    page = 1,
    search,
    size = 10,
  } = action.payload as CommonSearchParams;
  let params: CommonSearchParams = {
    organizationId,
    applicationId,
    type,
    page,
    size,
  };
  if (search) {
    params = {
      ...params,
      search,
    };
  }
  if (typeId) {
    params = {
      ...params,
      typeId,
    };
  }
  const res = yield call(API.fetchProjectItems, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushList(res.data, res.pageInfo));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchList), handleFetchList);
}

export default function* rootSaga() {
  yield all([watch()]);
}
