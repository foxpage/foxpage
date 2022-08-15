import { fork } from 'redux-saga/effects';

import content from './content';
import list from './list';

export default function* rootSaga() {
  yield fork(list);
  yield fork(content);
}
