import { fork } from 'redux-saga/effects';

import detail from './detail';
import groups from './groups';

export default function* rootSaga() {
  yield fork(detail);
  yield fork(groups);
}
