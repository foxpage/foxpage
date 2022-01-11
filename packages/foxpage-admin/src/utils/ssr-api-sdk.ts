import Fly from 'flyio/dist/npm/fly';

import { getLoginUser } from './login-user';

let inited = false;
let fly: any = {};

// TODO: need remove, merge to foxpage-api-sdk.js
const FoxpageApi = {
  initClient() {
    if (inited) {
      return;
    }

    fly = new Fly();

    // default baseurl
    fly.config.baseURL = APP_CONFIG.ssrApi;

    // default time out
    fly.config.timeout = 1000 * 60;

    // with cookies
    fly.config.withCredentials = false; // auto with cookies

    // set request interceptors
    fly.interceptors.request.use((request: any) => {
      const userInfo = getLoginUser();
      const token = userInfo.token;
      request.headers['token'] = token;
      return request;
    });

    // set response interceptors
    fly.interceptors.response.use((response: { data: any }) => response.data);
    // catch error
    // (err) => {
    //   message.error(`${err.status} - ${err.message}`);
    // },
    // );

    inited = true;
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
        // if (rs.code && rs.code === 401) {
        //   store.dispatch(
        //     push({
        //       pathname: '/login',
        //       state: { from: history.location },
        //     }),
        //   );
        // }
        if (cb) cb(rs);
      })
      .catch(() => {
        if (cb) cb({});
      });
  },
};

FoxpageApi.initClient();

export default FoxpageApi;
