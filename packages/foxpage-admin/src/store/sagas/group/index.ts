import { fork } from 'redux-saga/effects';

import application from './application';
import project from './project';
import team from './team';
import user from './user';

export default function* rootSaga() {
  yield fork(application);
  yield fork(project);
  yield fork(team);
  yield fork(user);
}
