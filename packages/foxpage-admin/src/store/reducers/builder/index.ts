import { combineReducers } from 'redux';

import component from './component';
import header from './header';
import main from './main';

const reducers = combineReducers({
  component,
  header,
  main,
});

export default reducers;
