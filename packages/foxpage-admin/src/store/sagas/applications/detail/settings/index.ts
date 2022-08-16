import { fork } from 'redux-saga/effects';

import app from './application';
import builder from './builder';

export default function* rootSaga() {
  yield fork(app);
  yield fork(builder);
}
