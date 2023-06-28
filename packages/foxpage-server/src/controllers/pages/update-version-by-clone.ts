import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { merger } from '@foxpage/foxpage-core';
import { ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG, TYPE, VERSION } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { CloneContentReq, ContentVersionDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('pages')
export class UpdatePageVersionDetailByClone extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update content version by clone special content version
   * 1, Get the source content version, project and app info
   * 2，Get the target content project and app info
   * 3，Check the source and target info to create new relations
   * 4，merge content,
   * 5, Replace schemas id and relation name
   * 6，Save target info
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
    let versionId = '';

    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.PAGE });

      !params.targetContentLocales && (params.targetContentLocales = []);

      // Check permission
      const hasAuth = await this.service.auth.content(params.targetContentId || params.sourceContentId, {
        ctx,
      });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4052001);
      }

      let contentLevelInfoPromise: Promise<any>[] = [];
      contentLevelInfoPromise[0] = this.service.content.info.getContentLevelInfo({
        id: params.sourceContentId,
      });
      if (params.targetContentId) {
        contentLevelInfoPromise[1] = this.service.content.info.getContentLevelInfo({
          id: params.targetContentId,
        });
      }

      // get source content info
      const [sourceContentLevelInfo, targetContentLevelInfo] = await Promise.all(contentLevelInfoPromise);
      if (!params.targetContentId) {
        const sourceContentExtend = this.service.content.tag.getTagsByKeys(
          sourceContentLevelInfo.contentInfo.tags,
          ['extendId'],
        );

        if (params.includeBase || params.targetContentLocales.length === 0) {
          params.targetContentLocales = [{ isBase: true }];
        } else if (!_.isEmpty(sourceContentExtend)) {
          params.targetContentLocales.push(sourceContentExtend);
        }
        const newContentInfo = this.service.content.info.create(
          {
            title: sourceContentLevelInfo.contentInfo.title + '_copy',
            fileId: sourceContentLevelInfo.fileInfo.id,
            applicationId: params.applicationId,
            type: sourceContentLevelInfo.contentInfo.type || TYPE.PAGE,
            tags: params.targetContentLocales,
          },
          { ctx },
        );
        params.targetContentId = newContentInfo.id;
      }

      // check the source and the target content scope
      const scopeType =
        !targetContentLevelInfo ||
        sourceContentLevelInfo.folderInfo.id === targetContentLevelInfo.folderInfo.id
          ? TYPE.PROJECT
          : sourceContentLevelInfo.applicationInfo.id === targetContentLevelInfo.applicationInfo.id
          ? TYPE.APPLICATION
          : TYPE.SYSTEM;

      // get source extension content
      let sourceContentInfo = sourceContentLevelInfo.versionInfo.content || {};
      if (params.includeBase) {
        const extension = this.service.content.tag.getTagsByKeys(sourceContentLevelInfo.contentInfo.tags, [
          'extendId',
        ]);
        if (extension.extendId) {
          const extendContentVersion = await this.service.version.live.getContentLiveDetails({
            contentIds: [extension.extendId],
          });
          sourceContentInfo = merger.merge(extendContentVersion[0]?.content || {}, sourceContentInfo, {
            strategy: merger.MergeStrategy.COMBINE_BY_EXTEND,
          });
        }
      }

      // get the relation need create in target content
      const newRelationObject = await this.service.content.relation.createNewRelations(
        sourceContentInfo.relation || {},
        {
          ctx,
          applicationId: params.applicationId,
          projectId: targetContentLevelInfo?.folderInfo?.id || sourceContentLevelInfo.folderInfo.id,
          scope: scopeType,
        },
      );

      // replace schema ids
      const schemaObject = this.service.version.info.updateSchemaIdRecursive(
        sourceContentInfo.schemas || [],
        {},
        { clearExtend: params.includeBase || false },
      );
      sourceContentInfo.schemas = schemaObject.schemas || [];

      const newVersionObject = this.service.version.info.createCopyVersion(
        sourceContentInfo,
        newRelationObject.idMaps,
      );
      newVersionObject.newVersion.id = params.targetContentId;

      // save new content
      if (targetContentLevelInfo?.versionInfo?.status !== VERSION.STATUS_BASE) {
        const maxVersion = await this.service.version.info.getMaxContentVersionDetail(params.targetContentId);
        const versionDetail = this.service.version.info.create(
          {
            contentId: params.targetContentId,
            version: this.service.version.number.getVersionFromNumber((maxVersion?.versionNumber || 0) + 1),
            versionNumber: (maxVersion?.versionNumber || 0) + 1,
            content: newVersionObject.newVersion,
          },
          { ctx },
        );
        versionId = versionDetail.id;
      } else {
        versionId = targetContentLevelInfo.versionInfo.id;
        ctx.transactions.push(
          this.service.version.info.updateDetailQuery(targetContentLevelInfo.versionInfo.id, {
            content: newVersionObject.newVersion,
          }),
        );
        this.service.userLog.addLogItem(targetContentLevelInfo.versionInfo, {
          ctx,
          actions: [LOG.CLONE, targetContentLevelInfo.contentInfo.type || '', TYPE.VERSION],
          category: { versionId, contentId: params.targetContentId },
        });
      }

      await this.service.content.info.runTransaction(ctx.transactions);

      return Response.success(i18n.content.saveToBaseContentSuccess, 1052001);
    } catch (err) {
      return Response.error(err, i18n.content.saveToBaseContentFailed, 3052001);
    } finally {
      if (versionId) {
        const versionRelationQuery = await this.service.relation.saveVersionRelations(versionId);
        await this.service.version.info.runTransaction([versionRelationQuery]);
      }
    }
  }
}
