import { fork } from 'redux-saga/effects';

import applications from './applications';
import builder from './builder';
import group from './group';
import login from './login';
import projects from './projects';
import register from './register';
import store from './store';
import system from './system';
import teams from './teams';
import workspace from './workspace';

export default function* rootSaga() {
  yield fork(group);
  yield fork(builder);
  yield fork(login);
  yield fork(register);
  yield fork(store);
  yield fork(workspace);
  yield fork(projects);
  yield fork(applications);
  yield fork(teams);
  yield fork(system);
}
