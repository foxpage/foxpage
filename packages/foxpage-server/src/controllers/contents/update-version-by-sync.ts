import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentVersion, DSL, File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG, STRUCTURE_TYPE, TAG, TYPE, VERSION } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { getContentSyncInfoRes, UpdateVersionBySyncReq } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('contents')
export class UpdateVersionInfoBySync extends BaseController {
  constructor() {
    super();
  }

  /**
   * update content version info by sync and relation infos,
   * the relation infos include file, content and version detail,
   * current do not sync app level relations,
   *
   * 1: check current user's authorize
   * 2: validate relations, exists and whether or not in current project
   * 3: save relations infos, if do not has build version, create it first
   * 4: save content info, include source sync info
   * @param params
   * @returns
   */
  @Put('/sync')
  @OpenAPI({
    summary: i18n.sw.updateVersionBySync,
    description: '',
    tags: ['Content'],
    operationId: 'update-version-by-sync',
  })
  @ResponseSchema(getContentSyncInfoRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateVersionBySyncReq): Promise<ResData<any>> {
    const { account = '' } = ctx.userInfo;
    const { applicationId = '', contentId = '', contentInfo = {}, syncSource = {} } = params;

    try {
      // check current user's authorize
      const userDetail = await this.service.user.getDetail({ account, deleted: false });
      if (this.notValid(userDetail)) {
        return Response.accessDeny(i18n.system.accessDeny, 4162501);
      }

      ctx.userInfo.id = userDetail.id as string;
      const [hasAuth, contentDetail] = await Promise.all([
        this.service.auth.content(contentId, { ctx }),
        this.service.content.info.getDetailById(contentId),
      ]);
      if (this.notValid(contentDetail) || contentDetail.applicationId !== applicationId) {
        return Response.warning(i18n.content.contentIdNotInApp, 2162501);
      }

      // different env sync content id not mapping
      const syncFromTag = _.find(contentDetail.tags, (tag) => tag.type === TAG.SYNC_FROM);
      if (syncFromTag && (syncFromTag.env !== syncSource.env || syncFromTag.id !== syncSource.contentId)) {
        return Response.warning(i18n.content.syncContentIdNotMapping, 2162502);
      }

      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4162502);
      }

      // validate relations info
      let relationIds: string[] = [];
      _.forIn(contentInfo.relations, (items) => {
        (items as any[]).forEach((item) => {
          !item.isAppLevel &&
            [TYPE.TEMPLATE, TYPE.BLOCK].indexOf(item.file.type) === -1 &&
            relationIds.push(item.content.id);
        });
      });

      const contentFileDetail = await this.service.file.info.getDetailById(contentDetail.fileId);
      const checkResult = await this.checkRelations(contentFileDetail.folderId, relationIds);

      // the relation content id exist and not in the target project
      if (checkResult.invalidRelations.length > 0) {
        return Response.accessDeny(
          i18n.content.contentConflict + ': ' + _.map(checkResult.invalidRelations, 'name').join(','),
          4162502,
        );
      }

      const targetContentVersion = await this.service.version.info.getMaxContentVersionDetail(contentId);
      contentInfo.content = this.replaceDslTemplate(contentInfo.content, targetContentVersion.content);

      // create and update relations
      await this.saveRelationsQuery({
        applicationId,
        relations: contentInfo.relations,
        validRelationIds: relationIds,
        existRelationIds: checkResult.existRelationIds,
        projectId: contentFileDetail.folderId,
        syncSource,
        ctx,
      });

      // update target content infos
      if (!syncFromTag) {
        const newTags = this.setSyncTag(
          contentDetail.tags,
          [{ type: TAG.SYNC_FROM, env: syncSource.env, id: syncSource.contentId }],
          [TAG.SYNC_FROM],
        );
        ctx.transactions.push(this.service.content.info.updateDetailQuery(contentId, { tags: newTags }));
      }
      await this.saveContentVersionQuery({ id: contentId, newContent: contentInfo.content, ctx });

      await this.service.version.info.runTransaction(ctx.transactions);

      this.service.userLog.addLogItem(targetContentVersion, {
        ctx,
        actions: [LOG.SYNC, contentDetail.type || '', TYPE.VERSION],
        category: { contentId, versionId: targetContentVersion.id },
      });

      return Response.success(
        {
          applicationId,
          folderId: contentFileDetail.folderId,
          fileId: contentDetail.fileId,
          contentId,
        },
        1162501,
      );
    } catch (err) {
      return Response.error(err, i18n.content.syncFailed, 3162501);
    }
  }

  /**
   * check the relation whether or not exist and in the same project
   * @param projectId
   * @param relationIds
   * @returns
   */
  async checkRelations(
    projectId: string,
    relationIds: string[],
  ): Promise<{ existRelationIds: string[]; invalidRelations: Record<string, string>[] }> {
    let invalidRelations: Record<string, string>[] = [];
    let existRelationIds: string[] = [];

    if (relationIds.length === 0) {
      return { existRelationIds, invalidRelations };
    }

    const relationContentParents = await this.service.content.list.getContentAllParents(relationIds);
    relationIds.forEach((relationId) => {
      if (relationContentParents[relationId]?.[1] && !relationContentParents[relationId][1].deleted) {
        existRelationIds.push(relationId);
        if (relationContentParents[relationId][1].id !== projectId) {
          invalidRelations.push({
            id: relationId,
            name: (relationContentParents[relationId][2] as never as File).name,
          });
        }
      }
    });

    return { existRelationIds, invalidRelations };
  }

  /**
   * create and update relation infos
   * @param relations
   * @param validRelationIds
   * @param existRelationIds
   * @param projectId;
   * @param ctx
   */
  async saveRelationsQuery(params: {
    applicationId: string;
    relations: any[];
    validRelationIds: string[];
    existRelationIds: string[];
    projectId: string;
    syncSource: Record<string, string>;
    ctx: FoxCtx;
  }): Promise<void> {
    const {
      applicationId,
      relations = {},
      validRelationIds = [],
      existRelationIds = [],
      projectId = '',
    } = params;

    const notExistRelationIds = _.difference(validRelationIds, existRelationIds);
    const existRelationBaseVersionList = await this.service.version.list.find({
      contentId: { $in: notExistRelationIds },
      deleted: false,
    });
    let contentVersionObject: Record<string, ContentVersion> = {};
    existRelationBaseVersionList.map((item) => {
      !contentVersionObject[item.contentId] && (contentVersionObject[item.contentId] = item);
    });

    _.forIn(relations, async (items) => {
      for (const item of items as any[]) {
        if (validRelationIds.indexOf(item.content.id) === -1) {
          continue;
        }

        if (existRelationIds.indexOf(item.content.id) === -1) {
          // create relation
          this.service.file.info.create(
            Object.assign({}, _.pick(item.file, ['id', 'name', 'type', 'subType', 'intro', 'tags']), {
              applicationId,
              folderId: projectId,
              tags: this.setSyncTag(item.file.tags, [
                { type: TAG.SYNC_FROM, env: params.syncSource.env || '' },
              ]),
              creator: params.ctx.userInfo.id,
            }),
            { ctx: params.ctx },
          );
          this.service.content.info.create(
            Object.assign({}, _.pick(item.content, ['id', 'title', 'type', 'fileId', 'tags']), {
              applicationId,
              tags: this.setSyncTag(item.content.tags, [
                { type: TAG.SYNC_FROM, env: params.syncSource.env || '' },
              ]),
              creator: params.ctx.userInfo.id,
            }),
            { ctx: params.ctx },
          );
          this.service.version.info.create(
            Object.assign({}, _.pick(item.version, ['id', 'content']), {
              contentId: item.content.id,
              creator: params.ctx.userInfo.id,
            }),
            { ctx: params.ctx },
          );
        } else {
          await this.saveContentVersionQuery({
            id: item.content.id,
            maxVersion: contentVersionObject[item.content.id] || {},
            newContent: item.version.content,
            ctx: params.ctx,
          });
        }
      }
    });
  }

  /**
   * create or update target content version detail
   * @param id
   * @param content
   * @param options
   */
  async saveContentVersionQuery(params: {
    id: string;
    newContent: DSL;
    ctx: FoxCtx;
    maxVersion?: Partial<ContentVersion>;
  }): Promise<void> {
    const { id = '' } = params;
    params.newContent.id = id;
    params.newContent.version && delete params.newContent.version;

    if (!params.maxVersion || _.isEmpty(params.maxVersion)) {
      params.maxVersion = await this.service.version.info.getContentLatestVersion({ contentId: id });
    }

    if (this.notValid(params.maxVersion) || params.maxVersion.status !== VERSION.STATUS_BASE) {
      const versionNumber = (params.maxVersion?.versionNumber || 0) + 1;
      this.service.version.info.create(
        {
          version: this.service.version.number.getVersionFromNumber(versionNumber),
          versionNumber: versionNumber,
          dslVersion: '1.0',
          content: params.newContent,
          contentId: id,
          creator: params.ctx.userInfo.id,
        },
        { ctx: params.ctx },
      );
    } else {
      params.ctx.transactions.push(
        this.service.version.info.updateDetailQuery(params.maxVersion.id as string, {
          content: params.newContent,
        }),
      );
    }
  }

  /**
   * set sync tags
   * @param tags
   * @param syncTags
   * @param removeTags
   * @returns
   */
  setSyncTag(
    tags: Record<string, any>[],
    syncTags: Record<string, any>[],
    removeTags: string[] = [TAG.SYNC_FROM, TAG.SYNC_TO],
  ): Record<string, any>[] {
    return _.dropWhile((tags || []) as any[], (tag) => removeTags.indexOf(tag.type) !== -1).concat(syncTags);
  }

  /**
   * get template info from dsl
   * @param dsl
   * @returns
   */
  getDslTemplate(dsl: DSL): any {
    let templateKey: string = '';
    let templateRelation: Record<string, any> = {};
    for (const key in dsl.relation || {}) {
      if (dsl.relation[key].type === TYPE.TEMPLATE) {
        templateKey = key;
        templateRelation = dsl.relation[key];
        break;
      }
    }

    return { templateKey, templateRelation };
  }

  /**
   * replace source content template by target template
   * @param sourceContentVersion
   * @param targetContentVersion
   * @returns
   */
  replaceDslTemplate(sourceContentVersion: DSL, targetContentVersion: DSL): DSL {
    const { templateKey, templateRelation } = this.getDslTemplate(targetContentVersion);
    const sourceTemplateInfo = this.getDslTemplate(sourceContentVersion);

    if (templateKey !== sourceTemplateInfo.templateKey) {
      sourceContentVersion.relation = _.omit(sourceContentVersion.relation, sourceTemplateInfo.templateKey);
      templateKey && (sourceContentVersion.relation[templateKey] = templateRelation);

      for (const item of sourceContentVersion.schemas) {
        if (item.type === STRUCTURE_TYPE.DSL_TEMPLATE) {
          item.directive = { tpl: '{{' + templateKey + '}}' };
        }
      }
    }

    return sourceContentVersion;
  }
}
