import { fork } from 'redux-saga/effects';

import dynamics from './dynamics';
import projects from './projects';
import recycles from './recycles';

export default function* rootSaga() {
  yield fork(dynamics);
  yield fork(recycles);
  yield fork(projects);
}
