import { combineReducers } from 'redux';

import login from './login';
import register from './register';
import user from './user';

const reducers = combineReducers({
  login,
  register,
  user,
});

export default reducers;
