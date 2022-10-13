import _ from 'lodash';

import { config } from '../../app.config';
import { RESPONSE_LEVEL } from '../../config/constant';
import { ResData, ResMsg } from '../types/index-types';

/**
 * @param  {any} data
 * @returns ResData
 */
export function success(data: any, status?: number): ResData<{}> | ResMsg {
  let body: any = { code: RESPONSE_LEVEL.SUCCESS };

  if (_.isString(data)) {
    body.msg = data;
  } else if (data?.pageInfo) {
    body.data = data?.data || {};
    body.pageInfo = data.pageInfo;
  } else {
    body.data = data;
  }

  body.status = status || 0;

  return body;
}

/** Return to the content of the downloaded file
 * @param  {Buffer} content
 * @returns Buffer
 */
export function download(content: Buffer): Buffer {
  return content;
}

/**
 * Back to warning prompt
 * @param  {string} msg
 * @returns ResMsg
 */
export function warning(msg: string, status?: number, data?: any): ResMsg {
  // ctx.response.status = 400;
  const body: ResMsg = {
    code: RESPONSE_LEVEL.WARNING,
    status: status || 1,
    msg: msg,
  };

  if (data) {
    body.data = data;
  }

  return body;
}

/**
 * Return error message
 * @param  {Error} error
 * @param  {string} msg
 * @returns ResMsg
 */
export function error(error: Error | unknown, msg: string, status?: number): ResMsg {
  const err = error as Error;

  const body = {
    code: RESPONSE_LEVEL.ERROR,
    status: status || 1,
    msg: msg || err.message,
    err: [err.message],
  };

  if (config.env !== 'test' && err.message.toLowerCase() !== 'mock error') {
    console.log(err);
  }

  return body;
}

/**
 * Return no permission
 * @param  {string} msg?
 * @returns ResMsg
 */
export function accessDeny(msg?: string, status?: number): ResMsg {
  const body = {
    code: RESPONSE_LEVEL.ACCESS_DENY,
    status: status || 1,
    msg: msg || 'Access Deny, please contact the App owner to authorization',
  };
  return body;
}
