import React from 'react';
import { Provider } from 'react-redux';

import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';

import App from '../../src/pages/group/Main';

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
        <App />
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
