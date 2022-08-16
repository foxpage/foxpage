import { fork } from 'redux-saga/effects';

import list from './list/index';
import detail from './detail';

export default function* rootSaga() {
  yield fork(detail);
  yield fork(list);
}
