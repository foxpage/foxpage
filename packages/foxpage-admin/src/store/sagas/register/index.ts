import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/register';
import * as API from '@/apis/register';
import { getBusinessI18n } from '@/pages/locale';
import { RegisterActionType } from '@/reducers/register';
import { UserRegisterParams } from '@/types/user';

function* handleRegister(action: RegisterActionType) {
  const { email, account, password, onSuccess } = action.payload as UserRegisterParams;
  yield put(ACTIONS.updateRegisterLoading(true));
  const {
    login: { registerFailed },
  } = getBusinessI18n();
  const res = yield call(API.register, { account, password, email });
  yield put(ACTIONS.updateRegisterLoading(false));
  if (res.code === 200) {
    if (typeof onSuccess === 'function') {
      onSuccess();
    }
  } else {
    message.error(res.msg || registerFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.register), handleRegister);
}

export default function* rootSaga() {
  yield all([watch()]);
}
