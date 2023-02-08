import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content, ContentStatus } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { VERSION } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { BatchLiveReq } from '../../types/validates/component-validate-types';
import { ContentDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('components')
export class BatchSetComponentLiveVersions extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the live version of the components
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('/batch-live-versions')
  @OpenAPI({
    summary: i18n.sw.setComponentContentLive,
    description: '',
    tags: ['Component'],
    operationId: 'batch-set-component-live-versions',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: BatchLiveReq): Promise<ResData<Content>> {
    try {
      // Permission check
      const hasAuth = await this.service.auth.application(params.applicationId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4112201);
      }

      const contentIds = _.map(params.idVersions, 'id');

      // Check component content id
      const [contentFileObject, versionList] = await Promise.all([
        this.service.file.list.getContentFileByIds(contentIds),
        this.service.version.list.getContentInfoByIdAndVersion(
          _.map(params.idVersions, (idVersion) => {
            return { contentId: idVersion.id, version: idVersion.version };
          }),
        ),
      ]);

      const notInApps: string[] = [];
      const invalidComponents: string[] = [];
      for (const contentId in contentFileObject) {
        if (contentFileObject[contentId].deleted !== false) {
          invalidComponents.push(contentId);
        }
        if (contentFileObject[contentId].applicationId !== params.applicationId) {
          notInApps.push(contentId);
        }
      }

      if (invalidComponents.length > 0) {
        return Response.warning(
          i18n.component.invalidContentId + ': ' + invalidComponents.join(', '),
          211201,
        );
      }

      if (notInApps.length > 0) {
        return Response.warning(i18n.component.componentNotInApp + ': ' + notInApps.join(', '), 2112202);
      }

      const invalidVersion: string[] = _.difference(contentIds, _.map(versionList, 'contentId'));
      const notBaseVersions: string[] = [];
      versionList.forEach((version) => {
        if (version.status !== VERSION.STATUS_BASE) {
          notBaseVersions.push(version.contentId);
        }
      });

      if (invalidVersion.length > 0) {
        return Response.warning(i18n.component.invalidVersionId + ': ' + invalidVersion.join(','), 2112203);
      }

      // if (notBaseVersions.length > 0) {
      //   return Response.warning(i18n.component.invalidVersionStatus + ': ' + notBaseVersions.join(', '), 2112204);
      // }

      // Set version release status, and content live version
      ctx.transactions.push(
        this.service.version.info.batchUpdateDetailQuery(
          { id: { $in: _.map(versionList, 'id') } },
          { status: VERSION.STATUS_RELEASE as ContentStatus },
        ),
      );

      const versionObject = _.keyBy(versionList, 'contentId');
      for (const idVersion of params.idVersions) {
        const versionNumber = this.service.version.number.createNumberFromVersion(idVersion.version);
        this.service.content.live.setLiveContent(
          idVersion.id,
          versionNumber,
          versionObject[idVersion.id].id,
          { ctx },
        );
        await this.service.component.updateReferLiveVersion(
          idVersion.id,
          contentFileObject[idVersion.id]?.id,
          { ctx },
        );
      }

      await this.service.content.info.runTransaction(ctx.transactions);

      return Response.success('Set component live version success', 1112201);
    } catch (err) {
      return Response.error(err, i18n.component.setComponentContentLiveFailed, 3112201);
    }
  }
}
