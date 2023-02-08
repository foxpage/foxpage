import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content, ContentStatus, ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE, VERSION } from '../../../config/constant';
import { ContentVersionString } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { PublishProjectPageReq, PublishProjectPageRes } from '../../types/validates/project-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('projects')
export class PublishProjectPage extends BaseController {
  constructor() {
    super();
  }

  /**
   * Publish the specified page under the project and set it to live, including the data that the page depends on
   * 1. Get the details of the content
   * 2, get the relations of the content
   * 3, filter the relations that need to be published
   * 4, set the release status, set the live status
   *
   * When setting relation live and page live, directly set to live, no need to check status and other information
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('/page-publish')
  @OpenAPI({
    summary: i18n.sw.publishProjectPages,
    description: '',
    tags: ['Project'],
    operationId: 'publish-project-page',
  })
  @ResponseSchema(PublishProjectPageRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: PublishProjectPageReq): Promise<ResData<ContentVersion>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.PROJECT });
      const hasAuth = await this.service.auth.folder(params.projectId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4040701);
      }

      // Get content version details
      let idVersionList: ContentVersionString[] = [];
      const [maxVersions, contentList] = await Promise.all([
        this.service.version.number.getContentMaxVersionByIds(params.ids),
        this.service.content.list.getDetailByIds(params.ids),
      ]);

      maxVersions.forEach((version) =>
        idVersionList.push({
          contentId: version._id,
          version: this.service.version.number.getVersionFromNumber(version.versionNumber),
        }),
      );

      let versionList: ContentVersion[] = [];
      if (idVersionList.length > 0) {
        versionList = await this.service.version.list.getContentInfoByIdAndVersion(idVersionList);
      }

      // Get relations
      const { ids, idVersions } = this.service.relation.getRelationIdsFromVersion(versionList, [
        TYPE.TEMPLATE,
      ]);

      // Recursively get all relations
      const allRelationList = await this.service.relation.getAllRelationsByIds(ids, idVersions);

      // TODO Need to exclude relation data under non-current projects

      // Check the validity of the relationship
      let invalidRelations: ContentVersionString[] = [];
      let releaseStatusIds: string[] = [];
      let liveStatusIds: Record<string, any> = {};
      allRelationList.forEach((relation) => {
        if (!relation.status || relation.status === VERSION.STATUS_DISCARD) {
          invalidRelations.push(relation);
        } else if (relation.status === VERSION.STATUS_BASE) {
          releaseStatusIds.push(relation.id);
        }
        liveStatusIds[relation.contentId] = { id: relation.id, version: relation.versionNumber || 0 };
      });

      // Return wrong relation information
      if (invalidRelations.length > 0) {
        const contentIds = _.map(invalidRelations, 'contentId');
        const contentFileObject = await this.service.file.list.getContentFileByIds(contentIds);
        return Response.warning(
          i18n.project.invalidPageRelations + ':' + _.map(_.toArray(contentFileObject), 'name').join(','),
          2040701,
        );
      }

      // Set publishing status
      let releaseCodes: Record<string, any> = {};
      const maxObject = _.keyBy(maxVersions, '_id');
      this.service.version.live.bulkSetVersionStatus(
        releaseStatusIds,
        VERSION.STATUS_RELEASE as ContentStatus,
        { ctx },
      );

      // The data of relation is set to live state, excluding data that is already live
      const liveStatusKeys = Object.keys(liveStatusIds);
      const liveStatusList = await this.service.content.list.getDetailByIds(liveStatusKeys);
      const liveStatusContentObject = _.keyBy(liveStatusList, 'id');
      for (const id of liveStatusKeys) {
        if (liveStatusContentObject[id]?.liveVersionNumber !== liveStatusIds[id].version) {
          this.service.content.live.setLiveContent(id, liveStatusIds[id].version || 0, liveStatusIds[id].id, {
            ctx,
            content: { id } as Content,
          });
        }
      }

      const contentObject = _.keyBy(contentList, 'id');
      const versionObject = _.keyBy(versionList, 'contentId');

      // The page is set to release and live status, excluding pages that are already live status
      for (const id of params.ids) {
        if (contentObject[id]?.liveVersionNumber === maxObject[id].versionNumber) {
          continue;
        }

        const liveParams = {
          applicationId: params.applicationId,
          id: versionObject[id].id,
          status: VERSION.STATUS_RELEASE as ContentStatus,
        };
        const [validateResult] = await Promise.all([
          this.service.version.check.versionCanPublish(versionObject[id].id),
          this.service.version.live.setVersionPublishStatus(liveParams, { ctx }),
        ]);

        if (!validateResult.publishStatus) {
          releaseCodes[id] = validateResult;
          continue;
        }

        this.service.content.live.setLiveContent(id, maxObject[id].versionNumber || 0, versionObject[id].id, {
          ctx,
          content: contentObject[id],
        });
      }

      // Page publishing results
      if (_.isEmpty(releaseCodes)) {
        await this.service.content.info.runTransaction(ctx.transactions);
        const newVersionList = await this.service.version.list.getContentInfoByIdAndVersion(idVersionList);
        return Response.success(newVersionList, 1040701);
      } else {
        return Response.warning(i18n.project.invalidRelationDataStatus, 2040702, releaseCodes);
      }
    } catch (err) {
      return Response.error(err, i18n.project.publishProjectPageFailed, 3040701);
    }
  }
}
