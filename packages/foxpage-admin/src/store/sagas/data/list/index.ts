import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/data/list';
import * as API from '@/apis/data';
import { getBusinessI18n } from '@/foxI18n/index';
import { DataActionType } from '@/reducers/data/list';
import { DataBaseQueryParams } from '@/types/index';
import { errorToast } from '@/utils/error-toast';

function* handleFetchCollectionList() {
  const res = yield call(API.fetchCollectionList);

  if (res.code === 200) {
    yield put(ACTIONS.pushCollectionList(res.data || []));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }
}

function* handleQueryDataBase(actions: DataActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params } = actions.payload as { params: DataBaseQueryParams };
  const res = yield call(API.queryDataBase, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushDataBaseResult(res.data || []));
  } else {
    const {
      global: { searchFailed },
    } = getBusinessI18n();

    errorToast(res, res?.msg || searchFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchCollectionList), handleFetchCollectionList);
  yield takeLatest(getType(ACTIONS.queryDataBase), handleQueryDataBase);
}

export default function* rootSaga() {
  yield all([watch()]);
}
