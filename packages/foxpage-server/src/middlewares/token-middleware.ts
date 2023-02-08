import fs from 'fs';

import jwt from 'jsonwebtoken';
import _ from 'lodash';
import { KoaMiddlewareInterface, Middleware } from 'routing-controllers';

import { config, i18n } from '../../app.config';
import { RESPONSE_LEVEL } from '../../config/constant';
import { FoxCtx } from '../types/index-types';

@Middleware({ type: 'before' })
export class TokenMiddleware implements KoaMiddlewareInterface {
  async use(ctx: FoxCtx, next: (err?: any) => Promise<any>): Promise<any> {
    // No need to verify the interface of the token
    // Get request token
    const jwtToken = <string>ctx.request.header?.token || '';

    // Parse the token
    let jwtTokenInfo: any = {};
    try {
      const publicKey = fs.readFileSync('./config/keys/public-key.pem');
      jwtTokenInfo = jwt.verify(jwtToken, publicKey, { algorithms: ['RS256'] });
    } catch (err) {
      jwtTokenInfo = {};
    }

    const currentTime: number = new Date().getTime();

    if (
      (!jwtTokenInfo.account || currentTime > jwtTokenInfo.exp * 1000) &&
      config.ignoreTokenPath.indexOf(ctx.request.path) === -1
    ) {
      ctx.body = { code: RESPONSE_LEVEL.INVALID_TOKEN, msg: i18n.system.invalidAccount };
    } else {
      // Add user information to ctx
      ctx.userInfo = { id: jwtTokenInfo.id || '', account: jwtTokenInfo.account || '' };
      ctx.log.user = jwtTokenInfo.account || '';
      await next();
    }
  }
}
