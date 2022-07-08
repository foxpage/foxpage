import { combineReducers } from 'redux';

import recycleBin from './recycleBin/recycleBin';
import project from './project';

const reducers = combineReducers({
  project,
  recycleBin,
});

export default reducers;
