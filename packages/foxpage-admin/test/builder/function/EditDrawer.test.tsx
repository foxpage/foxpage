import React from 'react';
import { Provider } from 'react-redux';

import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';

import Component from '../../../src/pages/builder/function/EditDrawer';
import { funcItem, pageParams } from '../../global.data';

const mockStore = configureStore([]);

describe('builder-condition-edit-drawer', () => {
  it('match snapshot', async () => {
    const wrapper = mount(
      <Provider
        store={mockStore({
          builder: {
            fn: {
              drawerVisible: true,
              drawerType: 'edit',
              selectFunc: funcItem,
            },
            page: pageParams,
          },
        })}
      >
        <Component />
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
