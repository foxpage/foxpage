import { fork } from 'redux-saga/effects';

import detail from './detail';
import list from './list';

export default function* rootSaga() {
  yield fork(detail);
  yield fork(list);
}
