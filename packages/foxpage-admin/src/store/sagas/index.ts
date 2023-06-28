import { fork } from 'redux-saga/effects';

import applications from './applications';
import builder from './builder';
import data from './data';
import history from './history';
import notice from './notice';
import projects from './projects';
import record from './record';
import screenshot from './screenshot';
import store from './store';
import system from './system';
import teams from './teams';
import workspace from './workspace';

export default function* rootSaga() {
  yield fork(applications);
  yield fork(builder);
  yield fork(data);
  yield fork(projects);
  yield fork(store);
  yield fork(system);
  yield fork(teams);
  yield fork(record);
  yield fork(workspace);
  yield fork(notice);
  yield fork(history);
  yield fork(screenshot);
}
