import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';

import Component from '../../../src/pages/components/business/content/ContentList';
import { pageParams } from '../../global.data';
import { content } from '../../mock/content.data';
import { mockUseLocation } from '../../utils';

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
mockUseLocation();

describe('component-content-list', () => {
  const onDelete = jest.fn();
  const onEdit = jest.fn();
  const props = {
    applicationId: pageParams.applicationId,
    folderId: pageParams.folderId,
    fileType: pageParams.fileType,
    loading: false,
    contents: [content],
    onEdit,
    onDelete,
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
