import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/system/user';
import * as API from '@/apis/system/user/index';
import { getBusinessI18n } from '@/foxI18n/index';
import { errorToast } from '@/utils/error-toast';

export function* handleFetchOrganizationList() {
  const res = yield call(API.fetchOrganizationList);
  if (res.code === 200) {
    yield put(ACTIONS.pushOrganizationList(res.data));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchOrganizationList), handleFetchOrganizationList);
}

export default function* rootSaga() {
  yield all([watch()]);
}
