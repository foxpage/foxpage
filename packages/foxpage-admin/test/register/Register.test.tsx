import React from 'react';
import { Provider } from 'react-redux';

import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';

import Register from '../../src/pages/register';

const mockStore = configureStore([]);

describe('@foxpage/foxpage-admin', () => {
  it('match snapshot', async () => {
    const wrapper = shallow(
      <Provider
        store={mockStore({
          register: {
            loading: true,
          },
        })}
      >
        <Register />
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
