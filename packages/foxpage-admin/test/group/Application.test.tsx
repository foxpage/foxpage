import React from 'react';
import { Provider } from 'react-redux';

import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';

import Application from '../../src/pages/group/application/detail';

const mockStore = configureStore([]);

describe('@foxpage/foxpage-admin', () => {
  it('match snapshot', async () => {
    const wrapper = shallow(
      <Provider store={mockStore({})}>
        <Application />
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
