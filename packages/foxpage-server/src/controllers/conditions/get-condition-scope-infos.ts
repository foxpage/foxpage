import 'reflect-metadata';

import _ from 'lodash';
import { Body, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { ContentScopeInfo, ContentVersionNumber } from '../../types/content-types';
import { PageData, ResData } from '../../types/index-types';
import { AppContentListRes } from '../../types/validates/page-validate-types';
import { ProjectScopeTypeReq } from '../../types/validates/project-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('conditions')
export class GetAppConditionScopeInfoList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the live version details under the application,
   * the latest version details under the project (not necessarily the live version)
   * @param  {AppContentVersionReq} params
   * @returns {PageContentData[]}
   */
  @Post('/scope-infos')
  @OpenAPI({
    summary: i18n.sw.getScopeConditions,
    description: '',
    tags: ['Condition'],
    operationId: 'get-condition-scope-info-list',
  })
  @ResponseSchema(AppContentListRes)
  async index(@Body() params: ProjectScopeTypeReq): Promise<ResData<PageData<ContentScopeInfo[]>>> {
    this.service.file.info.setPageSize(params);
    try {
      // Get the list of conditions under the application and project
      const conditionFolderId = await this.service.folder.info.getAppTypeFolderId({
        applicationId: params.applicationId,
        type: TYPE.CONDITION as AppFolderTypes,
      });

      let options: Record<string, any> = {};
      if (params.search) {
        options = { name: { $regex: new RegExp(params.search, 'i') } };
      } else if (params.names && params.names.length > 0) {
        options = { name: { $in: params.names } };
      }

      options.type = TYPE.CONDITION;

      const [appFileList, projectFileList] = await Promise.all([
        this.service.file.list.getFileListByFolderId(conditionFolderId, options),
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
        const itemVersionRelations = _.keyBy(versionRelations[version.contentId], 'id');
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
        1100301,
      );
    } catch (err) {
      return Response.error(err, i18n.condition.getAppScopeConditionFailed, 3100301);
    }
  }
}
