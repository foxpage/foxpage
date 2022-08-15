import { fork } from 'redux-saga/effects';

import components from './components';
import pages from './pages';
import templates from './templates';

export default function* rootSaga() {
  yield fork(components);
  yield fork(pages);
  yield fork(templates);
}
