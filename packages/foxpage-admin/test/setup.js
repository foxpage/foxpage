import 'babel-polyfill';

import {
  configure
} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({
  adapter: new Adapter(),
});

global.__DEV__ = true;
global.APP_CONFIG = require('../config.profile').dev;
