import { combineReducers } from 'redux';

import app from './application';
import builder from './builder';

const reducers = combineReducers({
  app,
  builder,
});

export default reducers;
