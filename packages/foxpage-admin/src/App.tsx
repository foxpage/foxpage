import React from 'react';
import { CookiesProvider } from 'react-cookie';
import { Provider } from 'react-redux';

import { Page } from './pages';
import { store } from './store';

const App = () => (
  <Provider store={store}>
    <CookiesProvider>
      <Page />
    </CookiesProvider>
  </Provider>
);

export default App;
