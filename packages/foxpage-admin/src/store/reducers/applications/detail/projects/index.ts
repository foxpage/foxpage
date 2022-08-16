import { combineReducers } from 'redux';

import content from './content';
import file from './file';
import folder from './folder';

const reducers = combineReducers({
  content,
  file,
  folder,
});

export default reducers;
