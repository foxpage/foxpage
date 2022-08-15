import { fork } from 'redux-saga/effects';

import recycleBin from './recycleBin/list';
import involved from './involved';
import personal from './personal';

export default function* rootSaga() {
  yield fork(involved);
  yield fork(personal);
  yield fork(recycleBin);
}
