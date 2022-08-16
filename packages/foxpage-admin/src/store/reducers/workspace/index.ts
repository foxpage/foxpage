import { combineReducers } from 'redux';

import dynamics from './dynamics/list';
import applications from './applications';
import projects from './projects';

const reducers = combineReducers({
  applications,
  dynamics,
  projects,
});

export default reducers;
