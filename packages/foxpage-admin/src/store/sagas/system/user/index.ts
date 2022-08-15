import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/system/user';
import * as API from '@/apis/system/user/index';
import { getBusinessI18n } from '@/foxI18n/index';

export function* handleFetchOrganizationList() {
  const rs = yield call(API.fetchOrganizationList);
  if (rs.code === 200) {
    yield put(ACTIONS.pushOrganizationList(rs.data));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    message.error(rs.msg || fetchListFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchOrganizationList), handleFetchOrganizationList);
}

export default function* rootSaga() {
  yield all([watch()]);
}
