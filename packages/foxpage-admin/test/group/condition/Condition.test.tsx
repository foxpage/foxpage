import React from 'react';
import { Provider } from 'react-redux';

import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';

import Component from '../../../src/pages/group/application/conditions';
import { condition } from '../../global.data';

const mockStore = configureStore([]);

describe('group-condition', () => {
  it('match snapshot', async () => {
    const wrapper = mount(
      <Provider
        store={mockStore({
          builder: {
            condition: {
              pageNum: 1,
              total: 1,
              fetching: false,
              list: [condition],
            },
          },
        })}
      >
        <Component />
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
