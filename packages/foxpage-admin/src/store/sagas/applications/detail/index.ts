import { fork } from 'redux-saga/effects';

import file from './file';
import packages from './packages';
import projects from './projects';
import resources from './resources';
import settings from './settings';

export default function* rootSaga() {
  yield fork(file);
  yield fork(packages);
  yield fork(projects);
  yield fork(resources);
  yield fork(settings);
}
