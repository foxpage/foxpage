import React from 'react';
import { Provider } from 'react-redux';

import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';

import Component from '../../../src/pages/components/business/content/ContentEditDrawer';
import { locales } from '../../global.data';
import { content } from '../../mock/content.data';

const mockStore = configureStore([]);

describe('component-content-edit', () => {
  const onClose = jest.fn();
  const onSave = jest.fn();
  const props = {
    open: true,
    locales,
    content,
    onSave,
    onClose,
  };
  it('match snapshot', async () => {

    const wrapper = mount(
      <Provider store={mockStore({})}>
        <Component {...props} />
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
