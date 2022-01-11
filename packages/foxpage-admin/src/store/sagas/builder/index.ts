import { fork } from 'redux-saga/effects';

import componentList from './component-list';
import componentLoad from './component-load';
import condition from './condition';
import fn from './function';
import more from './more';
import page from './page';
import ssr from './ssr';
import template from './template';
import templateSelect from './template-select';
import variable from './variable';

export default function* rootSaga() {
  yield fork(componentList);
  yield fork(componentLoad);
  yield fork(template);
  yield fork(templateSelect);
  yield fork(page);
  yield fork(ssr);
  yield fork(variable);
  yield fork(condition);
  yield fork(fn);
  yield fork(more);
}
