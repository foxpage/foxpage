import { Middleware } from '@reduxjs/toolkit';
import { createHashHistory } from 'history';
import { applyMiddleware, compose, createStore, PreloadedState } from 'redux';
import createSagaMiddleware from 'redux-saga';

import reducer from '@/reducers/index';
import saga from '@/sagas/index';
import { IWindow } from '@/types/index';

const sagaMiddleware = createSagaMiddleware();
const composeEnhancers = (window as unknown as IWindow).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const configureStore = ({
  preloadedState,
  middlewares = [],
}: {
  preloadedState: PreloadedState<unknown>;
  middlewares: Middleware[];
}) => {
  const store = createStore(reducer, preloadedState, composeEnhancers(applyMiddleware(sagaMiddleware, ...middlewares)));
  sagaMiddleware.run(saga);
  return store;
};

export const history = createHashHistory();
export const store = configureStore({
  preloadedState: {} as PreloadedState<unknown>,
  middlewares: [],
});
