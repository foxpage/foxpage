import { combineReducers } from 'redux';

import component from './component';
import header from './header';
import locker from './locker';
import main from './main';

const reducers = combineReducers({
  component,
  header,
  locker,
  main,
});

export default reducers;
