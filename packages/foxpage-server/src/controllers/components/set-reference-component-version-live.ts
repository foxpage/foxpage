import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG, TAG, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { SetReferenceComponentLiveReq } from '../../types/validates/component-validate-types';
import { ContentDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('components')
export class SetReferenceComponentLiveVersions extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the live version of the reference component
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('/reference-live-versions')
  @OpenAPI({
    summary: i18n.sw.setReferenceComponentLive,
    description: '',
    tags: ['Component'],
    operationId: 'set-reference-component-live-versions',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: SetReferenceComponentLiveReq): Promise<ResData<Content>> {
    const { applicationId = '', id = '', versionId = '' } = params;

    try {
      const hasAuth = await this.service.auth.application(applicationId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4113201);
      }

      const componentFileDetail = await this.service.file.info.getDetailById(id);
      if (this.notValid(componentFileDetail)) {
        return Response.warning(i18n.component.invalidFileId, 2113201);
      }

      const referenceTag = _.find(componentFileDetail.tags || [], { type: TAG.DELIVERY_REFERENCE });
      const referenceFileId = referenceTag?.reference?.id || '';
      if (!referenceFileId) {
        return Response.warning(i18n.component.invalidFileId, 2113202);
      }

      // validate reference component version
      let referenceContentDetail: Partial<Content> = {};
      if (versionId) {
        referenceContentDetail = await this.service.content.info.getDetail({ fileId: referenceFileId });
        const referenceVersionDetail = await this.service.version.info.getDetailById(versionId);
        if (
          this.notValid(referenceVersionDetail) ||
          referenceContentDetail.id !== referenceVersionDetail.contentId
        ) {
          return Response.warning(i18n.component.invalidVersionId, 2113203);
        }

        referenceTag.reference.liveVersionId = referenceVersionDetail.id;
        referenceTag.reference.liveVersion = referenceVersionDetail.version;
      } else {
        delete referenceTag.reference.liveVersionId;
        delete referenceTag.reference.liveVersion;
      }

      await this.service.file.info.updateDetail(id, {
        tags: _.concat(
          [referenceTag],
          _.reject(componentFileDetail.tags, (tag) => tag.type === TAG.DELIVERY_REFERENCE),
        ),
      });

      // set component live version update status
      ctx.operations.push(
        ...this.service.log.addLogItem(
          LOG.LIVE,
          <Content>Object.assign({}, referenceContentDetail, { applicationId }),
          {
            actionType: [LOG.LIVE, TYPE.CONTENT].join('_'),
            category: {
              type: TYPE.CONTENT,
              fileId: id,
              contentId: <string>referenceContentDetail.id,
              versionId,
            },
          },
        ),
      );

      return Response.success(i18n.component.setComponentContentLiveSuccess, 1113201);
    } catch (err) {
      return Response.error(err, i18n.component.setComponentContentLiveFailed, 3113201);
    }
  }
}
