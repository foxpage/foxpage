import { APP_CONFIG } from './app-config';

declare interface IWindow extends Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
  require: any;
  React: any;
  ReactDOM: any;
  define: (key: string, value: any) => {};
  APP_CONFIG: APP_CONFIG;
}
