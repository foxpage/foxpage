import { fork } from 'redux-saga/effects';

import record from './record';

export * from './service';

export default function* rootSaga() {
  yield fork(record);
}
