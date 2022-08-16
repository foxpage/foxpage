import { combineReducers } from 'redux';

import recycleBin from './recycleBin/list';
import involved from './involved';
import personal from './personal';

const reducers = combineReducers({
  involved,
  personal,
  recycleBin,
});

export default reducers;
