import { combineReducers } from 'redux';

import file from './file';
import packages from './packages';
import projects from './projects';
import resources from './resources';
import settings from './settings';

const reducers = combineReducers({
  file,
  packages,
  projects,
  resources,
  settings,
});

export default reducers;
