import Fly from 'flyio/dist/npm/fly';
import { createBrowserHistory } from 'history';

import getLinkByEnv from './linked-env';
import { getLoginUser } from './login-user';

let isInit = false;
let fly: any = {};
let history;

const FoxPageApi = {
  initClient() {
    if (isInit) {
      return;
    }

    fly = new Fly();

    // default baseurl
    // @ts-ignore
    fly.config.baseURL = APP_CONFIG.foxpageApi;

    // default time out
    fly.config.timeout = 1000 * 60;

    // with cookies
    fly.config.withCredentials = true; // auto with cookies

    // set request interceptors
    fly.interceptors.request.use((request) => {
      const {
        location: { hash, search },
      } = history;
      const userInfo = getLoginUser();
      const token = userInfo.token;
      request.headers['token'] = token;
      request.headers['url'] = `/${hash}${search}`;
      return request;
    });

    // set response interceptors
    fly.interceptors.response.use((response: { data: any }) => response.data);
    // catch error
    // (err) => {
    //   message.error(`${err.status} - ${err.message}`);
    // },
    // );
    history = createBrowserHistory();

    isInit = true;
  },

  // get request
  get(path: any, obj: any, cb: any, opt?: any) {
    const o = { method: 'get' };

    if (opt) Object.assign(o, opt);

    this.execute(path, obj, cb, o);
  },

  // create request
  post(path: any, obj: any, cb: any, opt?: any) {
    const o = { method: 'post' };

    if (opt) Object.assign(o, opt);

    this.execute(path, obj, cb, o);
  },

  // put request
  put(path: any, obj: any, cb: any, opt?: any) {
    const o = { method: 'put' };

    if (opt) Object.assign(o, opt);

    this.execute(path, obj, cb, o);
  },

  // delete request
  delete(path: any, obj: any, cb: any, opt?: any) {
    const o = { method: 'delete' };

    if (opt) Object.assign(o, opt);

    this.execute(path, obj, cb, o);
  },

  execute(path: any, obj: any, cb: (arg0: unknown) => void, opt: { method: string }) {
    fly
      .request(path, obj, opt)
      .then((rs: { code: number }) => {
        if (rs.code && rs.code === 401) {
          history.push({
            pathname: getLinkByEnv('/#/login'),
            state: { from: history.location },
          });
          location.reload();
        }
        if (cb) cb(rs);
      })
      .catch(() => {
        if (cb) cb({});
      });
  },
};

FoxPageApi.initClient();

export default FoxPageApi;
