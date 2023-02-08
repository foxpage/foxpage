import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { METHOD } from '../../../config/constant';
import { VersionWithExternal } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentVersionReq, PageContentDataRes } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('')
export class GetTypeItemLiveList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the details of the live version of the specified items under the application
   * @param  {AppContentVersionReq} params
   * @returns {VersionWithExternal[]}
   */
  @Post('variables/lives')
  @Post('conditions/lives')
  @Post('functions/lives')
  @OpenAPI({
    summary: i18n.sw.getAppConditions,
    description: '',
    tags: ['Condition'],
    operationId: 'get-condition-live-version-list',
  })
  @ResponseSchema(PageContentDataRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: AppContentVersionReq,
  ): Promise<ResData<VersionWithExternal[]>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.GET });
      const apiType = this.getRoutePath(ctx.request.url);

      let contentList = await this.service.content.list.getDetailByIds(params.ids);
      contentList = _.filter(contentList, (content) => {
        // filter the content id not in the app and not the type
        return content.applicationId === params.applicationId && content.type === apiType;
      });

      const contentLiveIds = _.pull(_.map(contentList, 'liveVersionId'), '') as string[];
      const pageList = await this.service.version.list.getDetailByIds(contentLiveIds);

      let pageVersions: VersionWithExternal[] = [];
      const contentObject = _.keyBy(contentList, 'id');
      pageList.forEach((item) => {
        pageVersions.push(
          Object.assign({}, item.content || {}, {
            name: contentObject[item.contentId]?.title || '',
            version: item.version || '',
            versionNumber: this.service.version.number.createNumberFromVersion(item.version || '0.0.1'),
            fileId: contentObject[item.contentId]?.fileId || '',
          }),
        );
      });

      return Response.success(pageVersions, 1161501);
    } catch (err) {
      return Response.error(err, i18n.condition.getAppConditionFailed, 3161501);
    }
  }
}
