import React from 'react';
import { Provider } from 'react-redux';

import { render } from 'enzyme';
import configureStore from 'redux-mock-store';

import Component from '../../src/pages/components/business/JsonEditor';

const mockStore = configureStore([]);

describe('@foxpage/foxpage-admin', () => {
  it('match snapshot', async () => {
    const wrapper = render(
      <Provider store={mockStore({})}>
        <Component refreshFlag={true} jsonData={{}} />
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
