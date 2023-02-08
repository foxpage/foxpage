import { fork } from 'redux-saga/effects';

import common from './common';
import login from './login';
import register from './register';
import user from './user';

export default function* rootSaga() {
  yield fork(common);
  yield fork(login);
  yield fork(register);
  yield fork(user);
}
