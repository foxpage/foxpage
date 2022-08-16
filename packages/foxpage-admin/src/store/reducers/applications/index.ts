import { combineReducers } from 'redux';

import list from './list/index';
import detail from './detail';

const reducers = combineReducers({
  detail,
  list,
});

export default reducers;
