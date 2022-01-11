import { fork } from 'redux-saga/effects';

import builder from './builder';
import group from './group';
import login from './login';
import register from './register';
import store from './store';
import workspace from './workspace';

export default function* rootSaga() {
  yield fork(group);
  yield fork(builder);
  yield fork(login);
  yield fork(register);
  yield fork(store);
  yield fork(workspace);
}
