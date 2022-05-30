import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/system';
import * as API from '@/apis/system';
import { getBusinessI18n } from '@/pages/locale';

export function* handleFetchOrganizationList() {
  // multi-language
  const {
    global: { fetchListFailed },
  } = getBusinessI18n();

  const rs = yield call(API.organizationsFetch);
  if (rs.code === 200) {
    yield put(ACTIONS.pushOrganizationList(rs.data));
  } else {
    message.error(rs.msg || fetchListFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchOrganizationList), handleFetchOrganizationList);
}

export default function* rootSaga() {
  yield all([watch()]);
}
