import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { ACTION, METHOD, TYPE } from '../../../config/constant';
import { VersionWithExternal } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentListRes, AppContentVersionReq } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('mocks')
export class GetMockList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the live version details of the mock specified under the application
   * @param  {AppContentVersionReq} params
   * @returns {VersionWithExternal[]}
   */
  @Post('/lives')
  @OpenAPI({
    summary: i18n.sw.getAppMocks,
    description: '',
    tags: ['Mock'],
    operationId: 'get-mock-live-version-list',
  })
  @ResponseSchema(AppContentListRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: AppContentVersionReq,
  ): Promise<ResData<VersionWithExternal[]>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.GET });
      const [pageList, contentList] = await Promise.all([
        this.service.content.live.getContentLiveDetails({
          applicationId: params.applicationId,
          type: TYPE.MOCK as FileTypes,
          contentIds: params.ids || [],
        }),
        this.service.content.list.getDetailByIds(params.ids),
      ]);

      let pageVersions: VersionWithExternal[] = [];
      const contentObject = _.keyBy(contentList, 'id');
      pageList.forEach((item) => {
        // format mock props value
        item.content.schemas = this.service.version.info.formatMockValue(item.content?.schemas, ACTION.GET);

        pageVersions.push(
          Object.assign({}, item.content || {}, {
            name: contentObject[item.contentId]?.title || '',
            version: item.version || '',
            fileId: contentObject[item.contentId]?.fileId || '',
          }),
        );
      });

      return Response.success(pageVersions, 1190601);
    } catch (err) {
      return Response.error(err, i18n.mock.getAppMockFailed, 3190601);
    }
  }
}
