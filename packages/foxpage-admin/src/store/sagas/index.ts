import { fork } from 'redux-saga/effects';

import applications from './applications';
import builder from './builder';
import projects from './projects';
import store from './store';
import system from './system';
import teams from './teams';
import workspace from './workspace';

export default function* rootSaga() {
  yield fork(applications);
  yield fork(builder);
  yield fork(projects);
  yield fork(store);
  yield fork(system);
  yield fork(teams);
  yield fork(workspace);
}
