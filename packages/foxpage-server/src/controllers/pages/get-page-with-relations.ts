import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { DSL_VERSION, METHOD } from '../../../config/constant';
import metric from '../../third-parties/metric';
import { PageContentRelationsAndExternal } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentListRes, AppContentVersionReq } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController()
export class GetAppPageLiveInfoList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the live version details of the specified page under the application,
   * and include the details of all the relations, the relation details of the already relations
   * Response [{content:{},relations:{templates:[],variables:[],conditions:[],functions:[],...}}]
   * @param  {AppContentVersionReq} params
   * @returns {PageContentData[]}
   */
  @Post('pages/live-infos')
  @Post('blocks/live-infos')
  @OpenAPI({
    summary: i18n.sw.getAppPagesLiveInfo,
    description: '',
    tags: ['Page'],
    operationId: 'get-type-live-version-info-list',
  })
  @ResponseSchema(AppContentListRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: AppContentVersionReq,
  ): Promise<ResData<PageContentRelationsAndExternal[]>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.GET });
      if (params.ids.length === 0) {
        return Response.success([], 1050901);
      }
      const contentFileObject = await this.service.file.list.getContentFileByIds(params.ids);
      const validContentIds: string[] = [];
      for (const contentId in contentFileObject) {
        if (contentFileObject[contentId].applicationId === params.applicationId) {
          validContentIds.push(contentId);
        }
      }

      // Get the live details of the specified contentIds and the relation details
      metric.time('content-relation');
      const contentVersionList = await this.service.version.live.getContentAndRelationVersion(
        validContentIds,
      );
      metric.block('getContentAndRelationVersion', 'content-relation');

      let templateIds: string[] = [];
      contentVersionList.forEach((version) => {
        if (version.relations && version.relations.templates && version.relations.templates[0]) {
          templateIds.push(version.relations.templates[0].id);
        }
      });

      metric.time('content-version');
      const [contentMockObject, contentList] = await Promise.all([
        this.service.content.mock.getMockLiveVersions(_.concat(validContentIds, templateIds)),
        this.service.content.list.getDetailByIds(validContentIds),
      ]);
      metric.block('getContentAndVersion', 'content-version');

      let dependMissing: string[] = [];
      let recursiveItem: string[] = [];
      let contentAndRelation: PageContentRelationsAndExternal[] = [];
      const contentObject = _.keyBy(contentList, 'id');

      contentVersionList.forEach((content) => {
        if (content.dependMissing && content.dependMissing.length > 0) {
          dependMissing = dependMissing.concat(content.dependMissing);
        }
        if (content.recursiveItem) {
          recursiveItem.push(content.recursiveItem);
        }

        if (content.relations?.templates?.[0]) {
          content.relations.templates[0] = _.merge(
            {},
            content.relations.templates[0],
            contentMockObject[content.relations.templates[0].id] || {},
          );
        }

        const mockRelations = contentMockObject[content.id]?.relations || {};
        content.relations = this.service.version.relation.moveMockRelations(content.relations, mockRelations);

        contentAndRelation.push(
          Object.assign({}, _.pick(content, ['relations']), {
            content: Object.assign({}, content.content, {
              dslVersion: content.dslVersion || DSL_VERSION,
              name: contentObject[content?.content?.id]?.title || '',
              version: <string>content.version,
              versionNumber: this.service.version.number.createNumberFromVersion(content.version || '0.0.1'),
              fileId: contentObject[content?.content?.id]?.fileId || '',
              extension: contentMockObject[content.id]?.extension || {},
            }),
            mock: contentMockObject[content.id]?.mock || {},
          }),
        );
      });

      if (dependMissing.length > 0) {
        return Response.error(new Error(dependMissing.join(',')), i18n.page.pageDependMissing, 3050901);
      }

      if (recursiveItem.length > 0) {
        return Response.error(new Error(recursiveItem.join(',')), i18n.page.pageHasRecursiveDepend, 3050902);
      }

      // send metric
      contentAndRelation.length === 0 && metric.empty(ctx.request.url, params.applicationId);

      return Response.success(contentAndRelation, 1050901);
    } catch (err) {
      return Response.error(err, i18n.condition.getAppPageFailed, 3050903);
    }
  }
}
