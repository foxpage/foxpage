import { fork } from 'redux-saga/effects';

import history from './history';

export default function* rootSaga() {
  yield fork(history);
}
