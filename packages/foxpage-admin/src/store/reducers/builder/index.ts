import { combineReducers } from 'redux';

import componentList from './component-list';
import condition from './condition';
import fn from './function';
import more from './more';
import page from './page';
import ssr from './ssr';
import template from './template';
import templateSelect from './template-select';
import variable from './variable';
import viewer from './viewer';

const reducers = combineReducers({
  viewer,
  template,
  componentList,
  ssr,
  page,
  variable,
  condition,
  fn,
  templateSelect,
  more,
});

export default reducers;
