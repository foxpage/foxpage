import { combineReducers } from 'redux';

import conditions from './conditions';
import functions from './functions';
import pages from './pages';
import templates from './templates';
import variables from './variables';

const reducers = combineReducers({
  conditions,
  functions,
  pages,
  templates,
  variables,
});

export default reducers;
