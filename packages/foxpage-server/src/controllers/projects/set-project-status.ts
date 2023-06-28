import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { METHOD, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { FolderDetailRes } from '../../types/validates/file-validate-types';
import { ProjectDeleteReq } from '../../types/validates/project-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('projects')
export class SetFolderStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set project folder deletion status
   * @param  {ProjectDeleteReq} params
   * @returns {File}
   */
  @Put('/status')
  @OpenAPI({
    summary: i18n.sw.setProjectDeleteStatus,
    description: '',
    tags: ['Project'],
    operationId: 'set-project-delete-status',
  })
  @ResponseSchema(FolderDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: ProjectDeleteReq): Promise<ResData<File>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.DELETE, type: TYPE.PROJECT });

      const [hasAuth, folderDetail] = await Promise.all([
        this.service.auth.folder(params.projectId, { ctx, mask: 4 }),
        this.service.folder.info.getDetailById(params.projectId),
      ]);

      if (this.notValid(folderDetail)) {
        return Response.warning(i18n.folder.invalidFolderId, 2040801);
      }

      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4040801);
      }

      if (folderDetail.parentFolderId === '') {
        return Response.warning(i18n.project.cannotDeleteSystemFolders, 2040802);
      }

      // get project page, template, block file list
      const fileList = await this.service.file.list.find({
        folderId: params.projectId,
        deleted: false,
        type: { $in: [TYPE.PAGE, TYPE.TEMPLATE, TYPE.BLOCK] },
      });
      // check file has live content
      const hasLiveContentFileIds = await this.service.file.check.checkFileHasLiveContent(
        _.map(fileList, 'id'),
      );
      if (hasLiveContentFileIds.length > 0) {
        return Response.warning(i18n.project.hasLiveContentFile, 2040803);
      }

      // Get a list of all folders, files, contents, and versions under the project
      const folderChildren = await this.service.folder.list.getAllChildrenRecursive({
        folderIds: [params.projectId],
        depth: 5,
        hasContent: true,
      });
      const allChildren = await this.service.folder.list.getIdsFromFolderChildren(
        folderChildren[params.projectId] || {},
      );
      allChildren.folders.push(folderDetail);

      // Set status, currently only allow deletion
      this.service.folder.info.batchSetFolderDeleteStatus(allChildren.folders, { ctx, type: TYPE.PROJECT });
      this.service.file.info.batchSetFileDeleteStatus(allChildren.files, { ctx });
      this.service.content.info.batchSetContentDeleteStatus(allChildren.contents, { ctx });
      this.service.version.info.batchSetVersionDeleteStatus(allChildren.versions, { ctx });

      await this.service.folder.info.runTransaction(ctx.transactions);
      const newFolderDetail = await this.service.folder.info.getDetailById(params.projectId);

      ctx.logAttr = Object.assign(ctx.logAttr, { id: params.projectId, type: TYPE.PROJECT });

      this.service.relation.removeVersionRelations({ folderIds: [params.projectId] });

      return Response.success(newFolderDetail, 1040801);
    } catch (err) {
      return Response.error(err, i18n.project.setDeleteStatusFailed, 3040801);
    }
  }
}
