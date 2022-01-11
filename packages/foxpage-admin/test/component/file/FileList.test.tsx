import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';

import Component from '../../../src/pages/components/business/file/FileList';
import { pageInfo, pageParams } from '../../global.data';
import { file } from '../../mock/file.data';

const mockStore = configureStore([]);
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
describe('component-file-list', () => {
  const onDelete = jest.fn();
  const onEdit = jest.fn();
  const onPageInfoChange = jest.fn();

  const props = {
    organizationId: pageParams.organizationId,
    applicationId: pageParams.applicationId,
    fileType: pageParams.fileType,
    list: [file],
    pageInfo,
    onEdit,
    onDelete,
    onPageInfoChange,
    loading: false,
  };
  it('match snapshot', async () => {
    const wrapper = mount(
      <Provider store={mockStore({})}>
        <BrowserRouter>
          <Component {...props} />
        </BrowserRouter>
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
