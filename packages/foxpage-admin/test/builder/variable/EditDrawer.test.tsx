import React from 'react';
import { Provider } from 'react-redux';

import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';

import Component from '../../../src/pages/builder/variable/EditDrawer';
import { pageParams, variable } from '../../global.data';

const mockStore = configureStore([]);

describe('builder-condition-edit-drawer', () => {
  it('match snapshot', async () => {
    const wrapper = mount(
      <Provider
        store={mockStore({
          builder: {
            variable: {
              editorDrawerOpen: true,
              editVariable: variable,
            },
            page: pageParams,
          },
        })}
      >
        <Component applicationId={pageParams.applicationId} folderId={pageParams.folderId} onSave={jest.fn()} />
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
