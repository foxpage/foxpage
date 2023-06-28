import 'reflect-metadata';

import crypto from 'crypto';

import _ from 'lodash';
import { Body, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { ResData } from '../../types/index-types';
import { ContentDetailRes, EncryptContentsReq } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

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
  @Post('/encrypt-validate')
  @OpenAPI({
    summary: i18n.sw.ValidateEncryptContent,
    description: '',
    tags: ['Content'],
    operationId: 'encrypt-contents',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Body() params: EncryptContentsReq): Promise<ResData<String>> {
    const { data = {}, token = '' } = params;
    try {
      if (!token) {
        return Response.warning(i18n.content.invalidEncryptToken, 2163001);
      }

      if (!data.contentId && !data.fileId) {
        return Response.success({ status: false }, 1163002);
      }
      const key = crypto.scryptSync('fck', 'salt', 24);
      const iv = Buffer.alloc(16, 0);
      const decipher = crypto.createDecipheriv('aes-192-cbc', key, iv);
      let decrypted = decipher.update(params.token, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      const encryptObject = JSON.parse(decrypted);

      let fileDetail: Partial<File> = {};
      if (data.contentId) {
        const contentDetail = await this.service.content.info.getDetailById(data.contentId);
        data.fileId = contentDetail?.fileId || '';
      }
      fileDetail = await this.service.file.info.getDetailById(data.fileId || '');

      return Response.success({ status: fileDetail.folderId === encryptObject[0] }, 1163001);
    } catch (err) {
      return Response.success({ status: false }, 1163003);
    }
  }
}
