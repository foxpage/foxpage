import { combineReducers } from 'redux';

import builder from './builder/index';
import store from './store/index';
import group from './group';
import login from './login';
import register from './register';
import workspace from './workspace';

const reducers = combineReducers({
  group,
  builder,
  login,
  register,
  store,
  workspace,
});

export default reducers;
