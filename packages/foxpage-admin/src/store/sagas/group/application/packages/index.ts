import { fork } from 'redux-saga/effects';

import detail from './detail';
import fast from './fast';
import list from './list';

export default function* rootSaga() {
  yield fork(detail);
  yield fork(fast);
  yield fork(list);
}
