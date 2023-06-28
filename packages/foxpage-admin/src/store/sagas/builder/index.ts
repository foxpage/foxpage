import { fork } from 'redux-saga/effects';

import component from './component';
import events from './events';
import header from './header';
import main from './main';
import recyclebin from './recyclebin';
import step from './step';
import validate from './validate';

export default function* rootSaga() {
  yield fork(component);
  yield fork(header);
  yield fork(main);
  yield fork(events);
  yield fork(step);
  yield fork(validate);
  yield fork(recyclebin);
}
