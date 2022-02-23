import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/login';
import * as API from '@/apis/login';
import { getBusinessI18n } from '@/pages/locale';
import { LoginActionType } from '@/reducers/login';
import { UserLoginParams } from '@/types/user';

export function* handleLogin(action: LoginActionType) {
  const { account, password, onSuccess } = action.payload as UserLoginParams;
  yield put(ACTIONS.updateLoginLoading(true));
  const {
    login: { loginFailed },
  } = getBusinessI18n();
  const res = yield call(API.login, { account, password });
  yield put(ACTIONS.updateLoginLoading(false));
  if (res.code === 200) {
    if (typeof onSuccess === 'function') {
      onSuccess(res.data);
    }
  } else {
    message.error(res.msg || loginFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.login), handleLogin);
}

export default function* rootSaga() {
  yield all([watch()]);
}
