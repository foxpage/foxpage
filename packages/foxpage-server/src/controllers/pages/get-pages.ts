import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { DSL_VERSION, METHOD } from '../../../config/constant';
import metric from '../../third-parties/metric';
import { PageContentData, VersionWithExternal } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentListRes, AppContentVersionReq } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController()
export class GetPageLivesList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the live version details of the specified page under the application
   * @param  {AppContentVersionReq} params
   * @returns {PageContentData[]}
   */
  @Post('pages/lives')
  @Post('templates/lives')
  @Post('blocks/lives')
  @OpenAPI({
    summary: i18n.sw.getAppPages,
    description: '',
    tags: ['Page'],
    operationId: 'get-page-live-version-list',
  })
  @ResponseSchema(AppContentListRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentVersionReq): Promise<ResData<PageContentData[]>> {
    try {
      const apiType = this.getRoutePath(ctx.request.url);

      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.GET });
      const [pageList, contentList] = await Promise.all([
        this.service.content.live.getContentLiveDetails({
          applicationId: params.applicationId,
          type: apiType as FileTypes,
          contentIds: params.ids,
        }),
        this.service.content.list.getDetailByIds(params.ids),
      ]);

      const contentObject = _.keyBy(contentList, 'id');
      const contentIds = _.map(pageList, 'contentId');
      const mockObject = await this.service.content.mock.getMockLiveVersions(contentIds);

      let pageVersions: VersionWithExternal[] = [];
      pageList.forEach((item) => {
        const mockRelations = mockObject[item.contentId]?.relations || {};
        item.content.relations = this.service.version.relation.moveMockRelations(
          item.content.relations,
          mockRelations,
        );

        pageVersions.push(
          Object.assign({}, item.content || {}, {
            dslVersion: item.dslVersion || DSL_VERSION,
            name: contentObject[item.contentId]?.title || '',
            version: item.version || '',
            versionNumber: this.service.version.number.createNumberFromVersion(item.version || '0.0.1'),
            fileId: contentObject[item.contentId]?.fileId || '',
            mock: mockObject[item.contentId]?.mock || {},
            extension: mockObject[item.contentId]?.extension || {},
          }),
        );
      });

      // send metric
      pageVersions.length === 0 && metric.empty(ctx.request.url, params.applicationId);

      return Response.success(pageVersions, 1051001);
    } catch (err) {
      return Response.error(err, i18n.condition.getAppPageFailed, 3051001);
    }
  }
}
