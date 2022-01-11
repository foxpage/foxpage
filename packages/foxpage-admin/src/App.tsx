import React from 'react';
import { CookiesProvider } from 'react-cookie';
import { Provider } from 'react-redux';

import Index from './pages';
import { store } from './store';

const App = () => (
  <Provider store={store}>
    <CookiesProvider>
      <Index />
    </CookiesProvider>
  </Provider>
);

// export default withRoot(App);

export default App;
