import { fork } from 'redux-saga/effects';

import content from './content';
import file from './file';
import folder from './folder';
import search from './search';

export default function* rootSaga() {
  yield fork(content);
  yield fork(file);
  yield fork(folder);
  yield fork(search);
}
