export type APP_CONFIG = {
  env: 'dev' | 'fat' | 'prd';
  foxpageApi: string;
}

export type __DEV__ = String;

export interface FoxWindow extends Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
  require: any;
  React: any;
  ReactDOM: any;
  define: (key: string, value: any) => {};
  APP_CONFIG: {};
}
