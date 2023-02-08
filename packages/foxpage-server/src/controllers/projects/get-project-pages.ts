import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content, FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD, TYPE } from '../../../config/constant';
import { ProjectPageContent } from '../../types/file-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { ProjectPageListRes, ProjectPagesReq } from '../../types/validates/project-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('projects')
export class GetProjectPagesList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the list of specified pages under the specified project
   * @param  {ProjectPagesReq} params
   * @param  {Header} headers
   * @returns {FolderInfo}
   */
  @Post('/files-info')
  @OpenAPI({
    summary: i18n.sw.getProjectPageList,
    description: '',
    tags: ['Project'],
    operationId: 'get-project-pages-list',
  })
  @ResponseSchema(ProjectPageListRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: ProjectPagesReq): Promise<ResData<ProjectPageContent>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.GET });

      // Verify the effectiveness of the project
      const projectDetail = await this.service.folder.info.getDetailById(params.projectId);
      if (this.notValid(projectDetail) || projectDetail.applicationId !== params.applicationId) {
        return Response.warning(i18n.project.invalidProjectId, 2040601);
      }

      // Get the pageId of the path
      let fileIds: string[] = [];
      let fileObject: Record<string, any> = {};
      for (const path of params.filter.pathList) {
        const pathList = _.pull(path.split('/'), '');
        const fileDetail = await this.service.file.info.getFileDetailByNames(
          {
            applicationId: params.applicationId,
            parentFolderId: params.projectId,
            pathList: <string[]>_.pull(_.dropRight(pathList), '', undefined, null),
            fileName: <string>_.last(pathList),
          },
          { ctx },
        );

        if (fileDetail) {
          fileIds.push(<string>fileDetail.id);
          fileObject[<string>fileDetail.id] = { name: path };
        }
      }

      // Get contentId
      const contentList = await this.service.content.file.getContentByFileIds(fileIds);
      const contentObject: Record<string, Content> = _.keyBy(contentList, 'id');
      const contentIds = _.map(contentList, 'id');
      const versionList = await this.service.content.live.getContentLiveDetails({
        applicationId: params.applicationId,
        type: TYPE.PAGE as FileTypes,
        contentIds,
      });

      const fileContent: ProjectPageContent[] = [];
      versionList.forEach((version) => {
        const fileId = contentObject[version.contentId].fileId;
        fileContent.push({
          fileId: fileId,
          path: fileObject[fileId]?.name || '',
          version: version.version || '',
          content: version.content || {},
        });
      });

      // Get live details
      return Response.success(fileContent, 1040601);
    } catch (err) {
      return Response.error(err, i18n.project.getProjectPagesFailed, 3040601);
    }
  }
}
