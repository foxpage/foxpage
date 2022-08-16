import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { ContentDetailRes, ContentDetailsReq } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('contents')
export class GetContentByIds extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get page details through contentIds
   * @param  {ContentListReq} params
   * @returns {ContentInfo}
   */
  @Post('')
  @OpenAPI({
    summary: i18n.sw.getContentDetails,
    description: '',
    tags: ['Content'],
    operationId: 'get-content-details',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: ContentDetailsReq): Promise<ResData<Content[]>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.GET });

      let contentList = await this.service.content.info.getDetailByIds(params.contentIds);
      contentList = _.filter(contentList, { deleted: false });

      // Check whether the content belongs to the specified application
      const fileList = await this.service.file.info.getDetailByIds(_.map(contentList, 'fileId'));
      const appFileIds: string[] = [];
      fileList.forEach((file) => {
        if (!file.deleted && file.applicationId === params.applicationId) {
          appFileIds.push(file.id);
        }
      });

      contentList = _.filter(
        contentList,
        (content) => !content.deleted && appFileIds.indexOf(content.fileId) !== -1,
      );

      return Response.success(contentList, 1160201);
    } catch (err) {
      return Response.error(err, i18n.content.getContentDetailsFailed, 3160301);
    }
  }
}
