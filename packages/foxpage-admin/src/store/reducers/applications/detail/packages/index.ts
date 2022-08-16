import { combineReducers } from 'redux';

import detail from './detail';
import fast from './fast';
import list from './list';

const reducers = combineReducers({
  detail,
  list,
  fast,
});

export default reducers;
