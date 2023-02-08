import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { ContentScopeInfo, ContentVersionNumber } from '../../types/content-types';
import { FoxCtx, PageData, ResData } from '../../types/index-types';
import { AppContentListRes } from '../../types/validates/page-validate-types';
import { ProjectScopeTypeReq } from '../../types/validates/project-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController()
export class GetAppTypeItemScopeInfoList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the live version details under the application,
   * the latest version details under the project (not necessarily the live version)
   * @param  {AppContentVersionReq} params
   * @returns {PageContentData[]}
   */
  @Post('conditions/scope-infos')
  @Post('variables/scope-infos')
  @OpenAPI({
    summary: i18n.sw.getScopeConditions,
    description: '',
    tags: ['Content'],
    operationId: 'get-type-item-scope-info-list',
  })
  @ResponseSchema(AppContentListRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: ProjectScopeTypeReq,
  ): Promise<ResData<PageData<ContentScopeInfo[]>>> {
    try {
      const apiType = this.getRoutePath(ctx.request.url);
      this.service.file.info.setPageSize(params);

      // Get the list of type item under the application and project
      const itemFolderId = await this.service.folder.info.getAppTypeFolderId({
        applicationId: params.applicationId,
        type: apiType as AppFolderTypes,
      });

      let options: Record<string, any> = {};
      if (params.search) {
        options = { name: { $regex: new RegExp(params.search, 'i') } };
      } else if (params.names && params.names.length > 0) {
        options = { name: { $in: params.names } };
      }

      options.type = apiType;

      const [appFileList, projectFileList] = await Promise.all([
        this.service.file.list.getFileListByFolderId(itemFolderId, options),
        this.service.file.list.getFileListByFolderId(params.id, options),
      ]);

      const [appContentList, projectContentList] = await Promise.all([
        this.service.content.file.getContentByFileIds(_.map(appFileList, 'id')),
        this.service.content.file.getContentByFileIds(_.map(projectFileList, 'id')),
      ]);

      const projectVersion = await this.service.version.number.getContentMaxVersionByIds(
        _.map(projectContentList, 'id'),
      );

      let appVersionNumbers: ContentVersionNumber[] = [];
      let versionNumbers: ContentVersionNumber[] = [];
      appContentList.forEach((content) => {
        appVersionNumbers.push({ contentId: content.id, versionNumber: content.liveVersionNumber });
      });

      projectVersion.forEach((content) => {
        versionNumbers.push({ contentId: content._id, versionNumber: content.versionNumber });
      });

      const contentObject = _.merge(_.keyBy(appContentList, 'id'), _.keyBy(projectContentList, 'id'));

      const [appVersionList, versionList] = await Promise.all([
        this.service.version.list.getContentByIdAndVersionNumber(appVersionNumbers),
        this.service.version.list.getContentByIdAndVersionNumber(versionNumbers),
      ]);

      const allVersionList = appVersionList.concat(versionList);

      // Get relations
      const [appVersionItemRelation, versionItemRelation, idLiveVersion] = await Promise.all([
        this.service.version.list.getVersionListRelations(appVersionList, true),
        this.service.version.list.getVersionListRelations(versionList, false),
        this.service.content.list.getContentLiveInfoByIds(_.uniq(_.map(allVersionList, 'contentId'))),
      ]);

      const versionRelations = _.merge(appVersionItemRelation, versionItemRelation);
      const idLiveVersionObject = _.keyBy(idLiveVersion, 'id');

      let contentVersionList: ContentScopeInfo[] = [];
      for (const version of allVersionList) {
        let itemVersionRelations: Record<string, any> = {};
        _.forIn(_.keyBy(versionRelations[version.contentId], 'id'), (item) => {
          itemVersionRelations[item.id] = Object.assign(
            { content: item },
            { contentId: item.id, version: item.version },
          );
        });
        const itemRelations: Record<string, any[]> = await this.service.relation.formatRelationResponse(
          itemVersionRelations,
        );

        contentVersionList.push({
          id: version.contentId || '',
          name: contentObject?.[version.contentId]?.title || '',
          versionNumber: version.versionNumber,
          isLiveVersion: idLiveVersionObject[version.contentId]?.liveVersionNumber === version.versionNumber,
          content: version.content || {},
          relations: itemRelations,
        });
      }

      return Response.success(
        {
          pageInfo: {
            total: contentVersionList.length,
            page: params.page,
            size: params.size,
          },
          data: _.chunk(contentVersionList, params.size)?.[params.page - 1] || [],
        },
        1161801,
      );
    } catch (err) {
      return Response.error(err, i18n.content.getAppScopeItemFailed, 3161801);
    }
  }
}
