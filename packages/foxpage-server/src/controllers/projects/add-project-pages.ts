import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentStatus, File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE, VERSION } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AddProjectPagesReq, ProjectListRes } from '../../types/validates/project-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('projects')
export class AddAppsPageDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Create page details under the new application project, create page, 
   * content and version through application ID, folderId
   * If version already exists, add a new version
   * The path field indicates that the folder is created, and the name is the file
   * {
        "name": "name1",
        "path":"common/abc",
        "content": {
          "locales": "",
          "detail": "{}"
        }
      }
   * @param  {FileDetailReq} params
   * @returns {File}
   */
  @Post('/files')
  @OpenAPI({
    summary: i18n.sw.addProjectPageDetail,
    description: '',
    tags: ['Project'],
    operationId: 'add-project-pages-detail',
  })
  @ResponseSchema(ProjectListRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AddProjectPagesReq): Promise<ResData<File>> {
    try {
      const [hasAuth, folderDetail] = await Promise.all([
        this.service.auth.folder(params.projectId, { ctx }),
        this.service.folder.info.getDetailById(params.projectId),
      ]);

      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4040101);
      }

      // Check the validity of applications and documents
      if (this.notValid(folderDetail)) {
        return Response.warning(i18n.project.invalidProjectId, 2040101);
      }

      if (folderDetail.applicationId !== params.applicationId) {
        return Response.warning(i18n.project.invalidApplicationIdOrProjectId, 2040102);
      }

      let newPageList: any[] = [];
      for (const file of params.files) {
        const filePathList = _.pull(file.path.split('/'), '');
        const fileDetail = await this.service.file.info.getFileDetailByNames(
          {
            applicationId: params.applicationId,
            parentFolderId: params.projectId,
            pathList: _.clone(filePathList),
            fileName: file.name,
          },
          { ctx, createNew: true },
        );

        let contentDetail = await this.service.content.info.getDetail({
          fileId: fileDetail?.id || '',
          deleted: false,
        });
        if (this.notValid(contentDetail)) {
          contentDetail = this.service.content.info.create(
            {
              title: file.name,
              tags: file.content?.locale ? [{ locale: file.content.locale }] : [],
              fileId: fileDetail?.id,
            },
            { ctx },
          );
        }

        const newVersionNumber: number = (contentDetail.liveVersionNumber || 0) + 1;
        const versionDetail = this.service.version.info.create(
          {
            contentId: contentDetail.id,
            version: this.service.version.number.getVersionFromNumber(newVersionNumber),
            content: file.content.detail ? JSON.parse(file.content.detail) : {},
            status: VERSION.STATUS_RELEASE as ContentStatus,
          },
          { ctx },
        );

        this.service.content.info.updateContentItem(
          contentDetail.id,
          { liveVersionNumber: newVersionNumber },
          { ctx },
        );

        newPageList.push({
          id: fileDetail.id,
          version: versionDetail.version,
          name: filePathList.join('/') + '/' + file.name,
          content: versionDetail.content || {},
        });
      }

      await this.service.folder.info.runTransaction(ctx.transactions);

      ctx.logAttr = Object.assign(ctx.logAttr, { id: params.projectId, type: TYPE.PROJECT });

      return Response.success(newPageList, 1040101);
    } catch (err) {
      return Response.error(err, i18n.project.addProjectPagesFailed, 3040101);
    }
  }
}
