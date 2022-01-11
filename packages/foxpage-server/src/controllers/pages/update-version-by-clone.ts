import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content, ContentVersion, File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { CloneContentReq, ContentVersionDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('pages')
export class UpdatePageVersionDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update content version by clone special content version
   * @param  {CloneContentReq} params
   * @returns {ContentVersion}
   */
  @Put('/clone')
  @OpenAPI({
    summary: i18n.sw.updatePageVersionDetail,
    description: '',
    tags: ['Page'],
    operationId: 'update-page-version-by-clone',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: CloneContentReq): Promise<ResData<ContentVersion>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.PAGE });

      // Check permission
      const hasAuth = await this.service.auth.content(params.targetContentId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny);
      }

      // Get source template details
      const contentList = await this.service.content.info.getDetailByIds([
        params.sourceContentId,
        params.targetContentId,
      ]);

      let sourceContentDetail: Partial<Content> = {};
      let targetContentDetail: Partial<Content> = {};
      contentList.forEach((content) => {
        content.id === params.sourceContentId && (sourceContentDetail = content);
        content.id === params.targetContentId && (targetContentDetail = content);
      });

      const sourceFileId = sourceContentDetail?.fileId || '';
      const targetFileId = targetContentDetail?.fileId || '';
      const fileList = await this.service.file.info.getDetailByIds([sourceFileId, targetFileId]);

      let sourceFileDetail: Partial<File> = {};
      let targetFileDetail: Partial<File> = {};
      fileList.forEach((file) => {
        file.id === sourceFileId && (sourceFileDetail = file);
        file.id === targetFileId && (targetFileDetail = file);
      });

      // TODO Content's file not in the application
      if (!sourceFileDetail || sourceFileDetail.applicationId !== params.applicationId) {
      }

      // Get the source content version detail
      const [versionList, targetBaseVersion] = await Promise.all([
        this.service.version.info.find({
          contentId: sourceContentDetail.id,
          versionNumber: sourceContentDetail.liveVersionNumber || 1,
        }),
        this.service.version.info.getMaxContentVersionDetail(params.targetContentId, { ctx }),
      ]);

      // Get version recursive relation detail
      const allRelations = await this.service.version.relation.getVersionRelations(
        _.keyBy(versionList, 'id'),
      );

      // Get all relations content detail
      const relationContentList = await this.service.content.list.getDetailByIds(_.keys(allRelations));

      const projectId = targetFileDetail.folderId || '';
      let relations: Record<string, Record<string, string>> = {};

      for (const content of relationContentList) {
        const relation = await this.service.file.info.copyFile(content.fileId, params.applicationId, {
          ctx,
          folderId: projectId,
          hasLive: true,
          relations,
        });
        relations = _.merge(relations, relation);
      }

      let sourceVersionDetail: Partial<ContentVersion> = {};
      if ((sourceContentDetail?.liveVersionNumber || 0) > 0) {
        sourceVersionDetail = await this.service.version.info.getContentVersionDetail({
          contentId: params.sourceContentId,
          versionNumber: sourceContentDetail.liveVersionNumber || 1,
        });
      } else {
        sourceVersionDetail = await this.service.version.info.getMaxContentVersionDetail(
          params.sourceContentId,
          { ctx },
        );
      }

      // Copy page content version to target content
      this.service.version.info.copyContentVersion(sourceVersionDetail.content, params.targetContentId, {
        ctx,
        relations,
        tempRelations: {},
        versionId: targetBaseVersion.id,
      });

      await this.service.version.info.runTransaction(ctx.transactions);

      return Response.success(i18n.page.cloneToPageSuccess);
    } catch (err) {
      return Response.error(err, i18n.content.updatePageVersionFailed);
    }
  }
}
