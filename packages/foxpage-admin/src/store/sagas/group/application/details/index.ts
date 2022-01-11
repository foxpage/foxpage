import { fork } from 'redux-saga/effects';

import files from './files';
import info from './info';

export default function* rootSaga() {
  yield fork(files);
  yield fork(info);
}
