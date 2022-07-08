import { combineReducers } from 'redux';

import application from './application';
import user from './user';

const reducers = combineReducers({
  application,
  user,
});

export default reducers;
