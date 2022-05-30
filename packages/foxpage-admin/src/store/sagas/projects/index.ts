import { fork } from 'redux-saga/effects';

import content from './content';
import detail from './detail';
import list from './list';

export default function* rootSaga() {
  yield fork(content);
  yield fork(detail);
  yield fork(list);
}
