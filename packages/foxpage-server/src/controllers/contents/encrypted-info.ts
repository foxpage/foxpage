import 'reflect-metadata';

import crypto from 'crypto';

import { Body, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { ResData } from '../../types/index-types';
import { ContentDetailRes, EncryptContentsReq } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

const algorithm = 'aes-192-cbc';

@JsonController('contents')
export class EncryptContents extends BaseController {
  constructor() {
    super();
  }

  /**
   * Create token by request params
   * @param  {EncryptContentsReq} params
   * @returns Content
   */
  @Post('/encrypt')
  @OpenAPI({
    summary: i18n.sw.EncryptContent,
    description: '',
    tags: ['Content'],
    operationId: 'encrypt-contents',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Body() params: EncryptContentsReq): Promise<ResData<String>> {
    try {
      let expireTime = Date.parse(new Date() + '') / 1000;
      if (!params.expireTime || params.expireTime <= expireTime) {
        expireTime += 86400 * 7;
      }

      // fck: foxpage controller key
      const key = crypto.scryptSync('fck', 'salt', 24);
      const iv = Buffer.alloc(16, 0);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(JSON.stringify([params.data.folderId || '', expireTime]), 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return Response.success({ token: encrypted }, 1162901);
    } catch (err) {
      return Response.error(err, i18n.content.encryptFailed, 3162901);
    }
  }
}
