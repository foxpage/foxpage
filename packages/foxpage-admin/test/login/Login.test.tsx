import React from 'react';
import { Provider } from 'react-redux';

import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';

import Login from '../../src/pages/login';

const mockStore = configureStore([]);

describe('@foxpage/foxpage-admin', () => {
  it('match snapshot', async () => {
    const wrapper = shallow(
      <Provider
        store={mockStore({
          login: {
            loading: true,
          },
        })}
      >
        <Login />
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
