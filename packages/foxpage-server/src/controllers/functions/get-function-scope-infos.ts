import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes, Content } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD, TYPE } from '../../../config/constant';
import { ContentScopeInfo, ContentVersionNumber } from '../../types/content-types';
import { FoxCtx, PageData, ResData } from '../../types/index-types';
import { AppContentListRes } from '../../types/validates/page-validate-types';
import { ProjectScopeTypeReq } from '../../types/validates/project-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('functions')
export class GetAppScopeFunctionList extends BaseController {
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
    summary: i18n.sw.getScopeFunctions,
    description: '',
    tags: ['Function'],
    operationId: 'get-function-scope-info-list',
  })
  @ResponseSchema(AppContentListRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: ProjectScopeTypeReq,
  ): Promise<ResData<PageData<ContentScopeInfo[]>>> {
    this.service.file.info.setPageSize(params);
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.DELETE });

      // Get the application, the list of functions under the project
      const folderId = await this.service.folder.info.getAppTypeFolderId({
        applicationId: params.applicationId,
        type: TYPE.FUNCTION as AppFolderTypes,
      });

      let options: Record<string, any> = {};
      if (params.search) {
        options = { name: { $regex: new RegExp(params.search, 'i') } };
      } else if (params.names && params.names.length > 0) {
        options = { name: { $in: params.names } };
      }

      options.type = TYPE.FUNCTION;

      const [appFileList, projectFileList] = await Promise.all([
        this.service.file.list.getFileListByFolderId(folderId, options),
        this.service.file.list.getFileListByFolderId(params.id, options),
      ]);

      const [appContentList, projectContentList] = await Promise.all([
        this.service.content.file.getContentByFileIds(_.map(appFileList, 'id')),
        this.service.content.file.getContentByFileIds(_.map(projectFileList, 'id')),
      ]);
      const projectVersion = await this.service.version.number.getContentMaxVersionByIds(
        _.map(projectContentList, 'id'),
      );

      let versionNumbers: ContentVersionNumber[] = [];
      appContentList.forEach((content) => {
        versionNumbers.push({ contentId: content.id, versionNumber: content.liveVersionNumber });
      });

      projectVersion.forEach((content) => {
        versionNumbers.push({ contentId: content._id, versionNumber: content.versionNumber });
      });

      const contentObject: Record<string, Content> = _.merge(
        _.keyBy(appContentList, 'id'),
        _.keyBy(projectContentList, 'id'),
      );
      const versionList = await this.service.version.list.getContentByIdAndVersionNumber(versionNumbers);

      let contentVersionList: ContentScopeInfo[] = [];
      contentVersionList = versionList.map((version) => {
        return Object.assign({
          id: version.contentId || '',
          name: contentObject?.[version.contentId]?.title || '',
          versionNumber: version.versionNumber,
          content: version.content || {},
        });
      });

      return Response.success(
        {
          pageInfo: {
            total: contentVersionList.length,
            page: params.page,
            size: params.size,
          },
          data: _.chunk(contentVersionList, params.size)?.[params.page - 1] || [],
        },
        1090401,
      );
    } catch (err) {
      return Response.error(err, i18n.function.getAppFunctionFailed, 3090401);
    }
  }
}
