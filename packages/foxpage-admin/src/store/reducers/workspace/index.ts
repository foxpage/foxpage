import { combineReducers } from 'redux';

import dynamics from './dynamics/dynamics';
import applications from './applications';
import projects from './projects';

const reducers = combineReducers({
  applications,
  projects,
  dynamics,
});

export default reducers;
