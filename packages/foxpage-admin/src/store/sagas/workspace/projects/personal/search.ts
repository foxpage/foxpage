import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/personal/search';
import { fetchList } from '@/apis/application';
import * as API from '@/apis/project';
import { getBusinessI18n } from '@/foxI18n/index';
import { ProjectSearchActionType } from '@/reducers/workspace/projects/personal/search';
import { ApplicationListFetchParams, CommonSearchParams } from '@/types/index';
import { errorToast } from '@/utils/error-toast';

function* handleFetchList(action: ProjectSearchActionType) {
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
    type,
    page,
    size,
    userType: 'user',
  };
  if (applicationId) {
    params = {
      ...params,
      applicationId,
    };
  }
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

function* handleFetchAPP(action: ProjectSearchActionType) {
  const { params } = action.payload as { params: ApplicationListFetchParams };
  const res = yield call(fetchList, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushAPPList(res.data || []));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchList), handleFetchList);
  yield takeLatest(getType(ACTIONS.fetchAPPList), handleFetchAPP);
}

export default function* rootSaga() {
  yield all([watch()]);
}
