import { combineReducers } from 'redux';

import content from './content';
import detail from './detail';
import list from './list';

const reducers = combineReducers({
  content,
  detail,
  list,
});

export default reducers;
