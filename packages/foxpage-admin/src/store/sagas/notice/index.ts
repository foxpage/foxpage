import { fork } from 'redux-saga/effects';

import main from './main';

export default function* rootSaga() {
  yield fork(main);
}
