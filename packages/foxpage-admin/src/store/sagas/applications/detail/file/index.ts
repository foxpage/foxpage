import { fork } from 'redux-saga/effects';

import conditions from './conditions';
import functions from './functions';
import pages from './pages';
import templates from './templates';
import variables from './variables';

export default function* rootSaga() {
  yield fork(conditions);
  yield fork(functions);
  yield fork(pages);
  yield fork(templates);
  yield fork(variables);
}
