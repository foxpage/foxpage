import { combineReducers } from 'redux';

import list from './list';
import packages from './packages';
import pages from './pages';
import resource from './resource';
import settings from './settings';
import templates from './templates';

const reducers = combineReducers({
  list,
  packages,
  resource,
  templates,
  pages,
  settings,
});

export default reducers;
