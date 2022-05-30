import { combineReducers } from 'redux';

import builder from './builder/index';
import store from './store/index';
import applications from './applications';
import group from './group';
import login from './login';
import projects from './projects';
import register from './register';
import system from './system';
import teams from './teams';
import workspace from './workspace';

const reducers = combineReducers({
  group,
  builder,
  login,
  register,
  store,
  workspace,
  projects,
  applications,
  teams,
  system,
});

export default reducers;
