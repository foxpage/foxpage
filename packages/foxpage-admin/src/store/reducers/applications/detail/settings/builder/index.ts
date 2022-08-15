import { combineReducers } from 'redux';

import components from './components';
import pages from './pages';
import templates from './templates';

const reducers = combineReducers({
  components,
  pages,
  templates,
});

export default reducers;
