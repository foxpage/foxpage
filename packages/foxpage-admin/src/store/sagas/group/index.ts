import { fork } from 'redux-saga/effects';

import application from './application';
import user from './user';

export default function* rootSaga() {
  yield fork(application);
  yield fork(user);
}
