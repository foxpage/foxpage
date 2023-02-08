import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD } from '../../../config/constant';
import metric from '../../third-parties/metric';
import { FoxCtx, ResData } from '../../types/index-types';
import { TagContentVersionReq, TagVersionRelationRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

interface TagContent {
  content: Content;
}

@JsonController('content')
export class GetContentTagContent extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the content of the specified tag
   * Response：
   * {* content: {content info}}[]
   * @param  {TagContentVersionReq} params
   * @returns {ContentInfo}
   */
  @Post('/tag-contents')
  @OpenAPI({
    summary: i18n.sw.getContentTagsVersions,
    description: '',
    tags: ['Content'],
    operationId: 'get-tag-contents',
  })
  @ResponseSchema(TagVersionRelationRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: TagContentVersionReq): Promise<ResData<TagContent[]>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.GET });

      !params.tags && (params.tags = []);

      // Get qualified content details
      metric.time('app-content-tags');
      const contentVersionList = await this.service.content.tag.getAppContentByTags(params);
      metric.block('getAppContentByTags', 'app-content-tags');

      // Return empty results
      if (contentVersionList.length === 0) {
        return Response.success([], 1160601);
      }

      const contentIds = _.map(contentVersionList, 'id');
      const contentList: Content[] = await this.service.content.info.getDetailByIds(contentIds);

      const tagContentList: TagContent[] = _.map(contentList, (content) => {
        return { content: content };
      });

      // send metric
      tagContentList.length === 0 && metric.empty(ctx.request.url, params.applicationId);

      return Response.success(tagContentList, 1160601);
    } catch (err) {
      return Response.error(err, i18n.content.getContentListFailed, 3160601);
    }
  }
}
