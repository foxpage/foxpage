import { combineReducers } from 'redux';

import dynamics from './dynamics';
import projects from './projects';
import recycles from './recycles';

const reducers = combineReducers({
  dynamics,
  recycles,
  projects,
});

export default reducers;
