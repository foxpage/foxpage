import { fork } from 'redux-saga/effects';

import content from './content';
import list from './list';
import version from './version';

export default function* rootSaga() {
  yield fork(list);
  yield fork(content);
  yield fork(version);
}
