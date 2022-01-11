import { fork } from 'redux-saga/effects';

import list from './list';
import component from './packages';
import page from './pages';
import resource from './resource';
import settings from './settings';
import template from './templates';

export default function* rootSaga() {
  yield fork(list);
  yield fork(component);
  yield fork(resource);
  yield fork(page);
  yield fork(template);
  yield fork(settings);
}
