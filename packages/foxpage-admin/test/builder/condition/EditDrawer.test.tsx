import React from 'react';
import { Provider } from 'react-redux';

import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';

import Component from '../../../src/pages/builder/condition/EditDrawer';
import { condition } from '../../global.data';

const mockStore = configureStore([]);

describe('builder-condition-edit-drawer', () => {
  it('match snapshot', async () => {
    const wrapper = mount(
      <Provider
        store={mockStore({
          builder: {
            condition: {
              drawerVisible: true,
              drawerType: 'edit',
              selectCondition: condition,
            },
          },
        })}
      >
        <Component applicationId="appl_uagWz8CC8WxD3Ux" folderId="fold_kPrzikuRoPxg9gg" />
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
