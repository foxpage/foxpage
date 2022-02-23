import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { METHOD } from '../../../config/constant';
import { PageContentRelations } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentListRes, AppContentVersionReq } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('templates')
export class GetAppTemplateBuildInfoList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the details of the build version of the specified template under the application,
   * and include the details of all the relations, the relation details of the already relations
   * Response [{content:{},relations:{templates:[],variables:[],conditions:[],functions:[],...}}]
   * @param  {AppContentVersionReq} params
   * @returns {PageContentData[]}
   */
  @Post('/draft-infos')
  @OpenAPI({
    summary: i18n.sw.getAppTemplatesBuildInfo,
    description: '',
    tags: ['Template'],
    operationId: 'get-template-build-version-info-list',
  })
  @ResponseSchema(AppContentListRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: AppContentVersionReq,
  ): Promise<ResData<PageContentRelations[]>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.GET });
      if (params.ids.length === 0) {
        return Response.success([], 1070601);
      }

      const contentFileObject = await this.service.file.list.getContentFileByIds(params.ids);
      const validContentIds: string[] = [];
      for (const contentId in contentFileObject) {
        if (contentFileObject[contentId].applicationId === params.applicationId) {
          validContentIds.push(contentId);
        }
      }

      // Get the live details of the specified contentIds and the relation details
      const contentVersionList = await this.service.version.live.getContentAndRelationVersion(
        validContentIds,
        true, // Get build version details
      );

      let dependMissing: string[] = [];
      let recursiveItem: string[] = [];
      let contentAndRelation: PageContentRelations[] = [];

      contentVersionList.forEach((content) => {
        const dependMissing: string[] = [];
        if (content.dependMissing && content.dependMissing.length > 0) {
          dependMissing.concat(content.dependMissing);
        }
        if (content.recursiveItem) {
          recursiveItem.push(content.recursiveItem);
        }
        contentAndRelation.push(_.pick(content, ['content', 'relations']));
      });

      if (dependMissing.length > 0) {
        return Response.error(new Error(dependMissing.join(',')), i18n.page.pageDependMissing, 3070601);
      }

      if (recursiveItem.length > 0) {
        return Response.error(new Error(recursiveItem.join(',')), i18n.page.pageHasRecursiveDepend, 3070602);
      }

      return Response.success(contentAndRelation, 1070601);
    } catch (err) {
      return Response.error(err, i18n.condition.getAppPageFailed, 3070603);
    }
  }
}
