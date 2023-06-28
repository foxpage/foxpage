import fs from 'fs';

import jwt from 'jsonwebtoken';
import _ from 'lodash';
import { KoaMiddlewareInterface, Middleware } from 'routing-controllers';

import { FoxCtx } from '../../../src/types/index-types';

@Middleware({ type: 'before' })
export class TokenMiddleware implements KoaMiddlewareInterface {
  async use(ctx: FoxCtx, next: (err?: any) => Promise<any>): Promise<any> {
    const jwtToken: string = <string>ctx.request.header?.token || '';

    // Parse the token
    let jwtTokenInfo: any = {};
    try {
      const publicKey = fs.readFileSync('../../config/keys/public-key.pem');
      jwtTokenInfo = jwt.verify(jwtToken, publicKey, { algorithms: ['RS256'] });
    } catch (err) {
      jwtTokenInfo = {};
    }

    ctx.userInfo = { id: jwtTokenInfo.id || '', account: jwtTokenInfo.account || '' };
    ctx.log.user = jwtTokenInfo.account || '';
    await next();
  }
}
