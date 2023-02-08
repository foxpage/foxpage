import { combineReducers } from 'redux';

import applications from './applications';
import builder from './builder';
import data from './data';
import history from './history';
import notice from './notice';
import projects from './projects';
import record from './record';
import store from './store';
import system from './system';
import teams from './teams';
import workspace from './workspace';

const reducers = combineReducers({
  applications,
  builder,
  data,
  projects,
  store,
  system,
  teams,
  workspace,
  record,
  notice,
  history,
});

export default reducers;
