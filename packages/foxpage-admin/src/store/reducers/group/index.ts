import { combineReducers } from 'redux';

import application from './application';
import project from './project';
import team from './team';
import user from './user';

const reducers = combineReducers({
  application,
  project,
  team,
  user,
});

export default reducers;
