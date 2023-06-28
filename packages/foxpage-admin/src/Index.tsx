import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';

import { loader } from '@monaco-editor/react';

import App from './App';

// change the source of the monaco files
loader.config({ paths: { vs: '/dist/vs' } });

ReactDOM.render(
  <HashRouter>
    <App />
  </HashRouter>,
  document.getElementById('app'),
);
