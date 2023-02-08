import { StateType } from 'typesafe-actions';

import { history, store } from './index';
import createRootReducer from './reducers';

const rootState = createRootReducer(history);

declare module 'typesafe-actions' {
  export type Store = StateType<typeof store>;

  export type RootState = StateType<typeof rootState>;
}
