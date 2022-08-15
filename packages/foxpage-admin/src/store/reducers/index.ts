import { combineReducers } from 'redux';

import applications from './applications';
import builder from './builder';
import projects from './projects';
import store from './store';
import system from './system';
import teams from './teams';
import workspace from './workspace';

const reducers = combineReducers({
  applications,
  builder,
  projects,
  store,
  system,
  teams,
  workspace,
});

export default reducers;
