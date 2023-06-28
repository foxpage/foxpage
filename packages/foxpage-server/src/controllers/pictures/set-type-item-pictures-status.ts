import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { FoxCtx, ResData } from '../../types/index-types';
import { SetPictureStatusReq, UploadPictureRes } from '../../types/validates/picture-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('pictures')
export class SetItemPicturesStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the status of picture
   * @param  {SetPictureStatusReq} params
   * @returns {UploadPictureRes}
   */
  @Put('/status')
  @OpenAPI({
    summary: i18n.sw.setItemPictureStatus,
    description: '',
    tags: ['Picture'],
    operationId: 'set-item-picture-status',
  })
  @ResponseSchema(UploadPictureRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: SetPictureStatusReq): Promise<ResData<any[]>> {
    const { applicationId = '', ids = [] } = params;

    try {
      const hasAuth = await this.service.auth.application(applicationId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4210401);
      }

      const pictureItems = await this.service.picture.getDetailByIds(ids);
      const picAppIds = _.map(pictureItems, 'category.applicationId');
      if (picAppIds.length === 0 || _.uniq(picAppIds).length !== 1 || picAppIds[0] !== applicationId) {
        return Response.warning(i18n.app.invalidAppId, 2210401);
      }

      await this.service.picture.batchUpdateDetail(ids, { deleted: true });

      return Response.success(i18n.picture.setItemPictureStatusSuccess, 1210401);
    } catch (err) {
      return Response.error(err, i18n.picture.setItemPictureStatusFailed, 3210401);
    }
  }
}
