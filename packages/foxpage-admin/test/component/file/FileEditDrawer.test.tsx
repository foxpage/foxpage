import React from 'react';
import { Provider } from 'react-redux';

import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';

import Component from '../../../src/pages/components/business/file/FileEditDrawer';
import { file } from '../../mock/file.data';

const mockStore = configureStore([]);

describe('component-file-edit', () => {
  const onClose = jest.fn();
  const onSave = jest.fn();
  const props = {
    open: true,
    file,
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
