import { combineReducers } from 'redux';

import detail from './detail';
import groups from './groups';

const reducers = combineReducers({
  groups,
  detail,
});

export default reducers;
