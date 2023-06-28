import { combineReducers } from 'redux';

import component from './component';
import header from './header';
import locker from './locker';
import main from './main';
import recyclebin from './recyclebin';

const reducers = combineReducers({
  component,
  header,
  locker,
  main,
  recyclebin,
});

export default reducers;
