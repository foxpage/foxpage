import { combineReducers } from 'redux';

import content from './content';
import list from './list';

const reducers = combineReducers({
  list,
  content,
});

export default reducers;
