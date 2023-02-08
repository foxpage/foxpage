import { combineReducers } from 'redux';

import common from './common';
import login from './login';
import register from './register';
import user from './user';

const reducers = combineReducers({
  common,
  login,
  register,
  user,
});

export default reducers;
