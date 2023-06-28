import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { METHOD } from '../../../config/constant';
import picture from '../../third-parties/picture';
import { FoxCtx, ResData } from '../../types/index-types';
import { UploadPictureReq, UploadPictureRes } from '../../types/validates/picture-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('pictures')
export class UploadPicture extends BaseController {
  constructor() {
    super();
  }

  /**
   * upload picture, response picture url
   * @param  {UploadPictureReq} params
   * @returns {UploadPictureRes}
   */
  @Post('/upload')
  @OpenAPI({
    summary: i18n.sw.uploadPicture,
    description: '',
    tags: ['Picture'],
    operationId: 'upload-picture',
  })
  @ResponseSchema(UploadPictureRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: UploadPictureReq,
  ): Promise<ResData<Record<string, string>>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.GET });

      const picResult = await picture.upload(params);

      return Response.success(picResult.data || {}, 1210101);
    } catch (err) {
      return Response.error(err, i18n.picture.uploadPictureFailed, 3210101);
    }
  }
}
