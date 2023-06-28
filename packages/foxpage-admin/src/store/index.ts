import { createHashHistory } from 'history';
import { applyMiddleware, compose, legacy_createStore as createStore, PreloadedState } from 'redux';
import createSagaMiddleware from 'redux-saga';

import reducer from '@/reducers/index';
import saga from '@/sagas/index';
import { FoxWindow } from '@/types/index';

const sagaMiddleware = createSagaMiddleware();
const composeEnhancers = (window as unknown as FoxWindow).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const configureStore = ({ preloadedState }: { preloadedState: PreloadedState<unknown> }) => {
  const store = createStore(reducer, preloadedState as {}, composeEnhancers(applyMiddleware(sagaMiddleware)));
  sagaMiddleware.run(saga);
  return store;
};

export const history = createHashHistory();
export const store = configureStore({
  preloadedState: {} as PreloadedState<unknown>,
});
