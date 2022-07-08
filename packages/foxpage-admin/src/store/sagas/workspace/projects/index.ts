import { fork } from 'redux-saga/effects';

import recycleBin from './recycleBin/recycleBin';
import project from './project';

export default function* rootSaga() {
  yield fork(project);
  yield fork(recycleBin);
}
