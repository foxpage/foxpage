import { combineReducers } from 'redux';

import content from './content';
import version from './version';
import list from './list';

const reducers = combineReducers({
  list,
  content,
  version,
});

export default reducers;
