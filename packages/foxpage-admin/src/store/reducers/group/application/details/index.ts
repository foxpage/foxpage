import { combineReducers } from 'redux';

import files from './files';
import info from './info';

const reducers = combineReducers({
  files,
  info,
});

export default reducers;
