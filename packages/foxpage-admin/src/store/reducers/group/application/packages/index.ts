import { combineReducers } from 'redux';

import detail from './detail';
import list from './list';

const reducers = combineReducers({
  detail,
  list,
});

export default reducers;
