import { combineReducers } from 'redux';

import content from './content';
import file from './file';
import folder from './folder';
import search from './search';

const reducers = combineReducers({
  content,
  file,
  folder,
  search,
});

export default reducers;
