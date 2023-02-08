import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { DSL_VERSION, METHOD, TYPE } from '../../../config/constant';
import metric from '../../third-parties/metric';
import { PageContentRelationInfos, PageContentRelationsAndExternal } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentListRes, AppContentVersionReq } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('')
export class GetAppPageBuildInfoList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the details of the build version of the specified page under the application,
   * and include the details of all the relations, the relation details of the already relations
   * Response [{content:{},relations:{templates:[],variables:[],conditions:[],functions:[],...}}]
   * @param  {AppContentVersionReq} params
   * @returns {PageContentData[]}
   */
  @Post('pages/draft-infos')
  @Post('templates/draft-infos')
  @Post('blocks/draft-infos')
  @OpenAPI({
    summary: i18n.sw.getAppPagesBuildInfo,
    description: '',
    tags: ['Page'],
    operationId: 'get-page-build-version-info-list',
  })
  @ResponseSchema(AppContentListRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: AppContentVersionReq,
  ): Promise<ResData<PageContentRelationsAndExternal[]>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.DELETE });
      if (params.ids.length === 0) {
        return Response.success([], 1050501);
      }

      const apiType = this.getRoutePath(ctx.request.url);

      metric.time('content-file');
      const contentFileObject = await this.service.file.list.getContentFileByIds(params.ids);
      metric.block('getContentFileByIds', 'content-file');

      const validContentIds: string[] = [];
      for (const contentId in contentFileObject) {
        if (contentFileObject[contentId].applicationId === params.applicationId) {
          validContentIds.push(contentId);
        }
      }

      // Get the live details of the specified contentIds and the relation details
      let contentPromise: any[] = [];
      contentPromise[0] = this.service.version.live.getContentAndRelationVersion(validContentIds, true);
      if (apiType === TYPE.PAGE) {
        contentPromise[1] = this.service.content.list.getDetailByIds(validContentIds);
      }
      metric.time('content-relation');
      const [contentVersionList, contentList] = await Promise.all(contentPromise);
      metric.block('getContentAndRelation', 'content-relation');

      let templateIds: string[] = [];
      (<PageContentRelationInfos[]>contentVersionList).forEach((content) => {
        if (content.relations?.templates && content.relations.templates.length > 0) {
          templateIds.push(content.relations.templates[0].id);
        }
      });

      // get mock build content and template live version
      metric.time('content-version');
      const [mockObject, templateMockObject] = await Promise.all([
        this.service.content.mock.getMockBuildVersions(params.ids),
        this.service.content.mock.getMockLiveVersions(templateIds),
      ]);
      metric.block('getContentVersion', 'content-version');

      let dependMissing: string[] = [];
      let recursiveItem: string[] = [];
      let contentAndRelation: PageContentRelationsAndExternal[] = [];
      const contentObject = _.keyBy(<Content[]>contentList || [], 'id');

      (<PageContentRelationInfos[]>contentVersionList).forEach((content) => {
        const dependMissing: string[] = [];
        if (content.dependMissing && content.dependMissing.length > 0) {
          dependMissing.concat(content.dependMissing);
        }

        if (content.recursiveItem) {
          recursiveItem.push(content.recursiveItem);
        }

        if (content.relations?.templates && content.relations.templates.length > 0) {
          const templateId = content.relations.templates[0].id;
          (<any>content.relations.templates[0]).extension = templateMockObject[templateId]?.extension || {};
          (<any>content.relations.templates[0]).mock = templateMockObject[templateId]?.mock || {};
        }

        if (apiType === TYPE.PAGE) {
          const mockRelations = mockObject[content.id]?.relations || {};
          const mockTemplateRelations =
            templateMockObject[content.relations?.templates?.[0]?.id]?.relations || {};
          content.relations = this.service.version.relation.moveMockRelations(
            content.relations,
            mockRelations,
          );
          content.relations = this.service.version.relation.moveMockRelations(
            content.relations,
            mockTemplateRelations,
          );
        }

        contentAndRelation.push({
          content: Object.assign({}, content.content || {}, {
            extension: this.service.content.info.getContentExtension(contentObject[content.id], [
              'extendId',
              'mockId',
            ]),
            dslVersion: content.dslVersion || DSL_VERSION,
            fileId: contentObject[content.id]?.fileId || '',
          }),
          relations: content.relations || {},
          mock: mockObject[content.id]?.mock || {},
        });
      });

      if (dependMissing.length > 0) {
        return Response.error(new Error(dependMissing.join(',')), i18n.page.pageDependMissing, 3050501);
      }

      if (recursiveItem.length > 0) {
        return Response.error(new Error(recursiveItem.join(',')), i18n.page.pageHasRecursiveDepend, 3050502);
      }

      // send metric
      contentAndRelation.length === 0 && metric.empty(ctx.request.url, params.applicationId);

      return Response.success(contentAndRelation, 1050501);
    } catch (err) {
      return Response.error(err, i18n.condition.getAppPageFailed, 3050503);
    }
  }
}
