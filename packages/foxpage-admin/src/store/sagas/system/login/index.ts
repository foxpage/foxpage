import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/system/login';
import * as API from '@/apis/system/login/index';
import { getBusinessI18n } from '@/foxI18n/index';
import { LoginActionType } from '@/reducers/system/login';
import { LoginParams } from '@/types/index';

export function* handleLogin(action: LoginActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { account, password, type, onSuccess } = action.payload as LoginParams;
  const res = yield call(API.login, { account, password, type });
  if (res.code === 200) {
    if (typeof onSuccess === 'function') {
      onSuccess(res.data);
    }
  } else {
    const {
      login: { loginFailed },
    } = getBusinessI18n();

    message.error(loginFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.login), handleLogin);
}

export default function* rootSaga() {
  yield all([watch()]);
}
