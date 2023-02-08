import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { LockContentDetail } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { LockBuildContentReq, LockBuildContentRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('contents')
export class UnlockBuildContent extends BaseController {
  constructor() {
    super();
  }

  /**
   * unlock the content version data with current user
   * @param  {LogBuildContentReq} params
   * @returns {LockContentDetail}
   */
  @Put('/unlock')
  @OpenAPI({
    summary: i18n.sw.unlockBuildContent,
    description: '',
    tags: ['Content'],
    operationId: 'unlock-build-content',
  })
  @ResponseSchema(LockBuildContentRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: LockBuildContentReq): Promise<ResData<LockContentDetail>> {
    const { applicationId = '', contentId = '', versionId = '' } = params;

    if (!applicationId || !contentId || !versionId) {
      return Response.warning(i18n.content.invalidAppOrContentIdOrVersionId, 2161301);
    }

    try {
      const versionDetail = await this.service.version.info.getDetailById(versionId);

      if (this.notValid(versionDetail)) {
        return Response.warning(i18n.content.invalidVersionId, 2161302);
      }

      let canUnlock = true;
      const versionOperator = versionDetail.operator || {};
      if (versionOperator.userInfo?.id && versionOperator.userInfo.id !== ctx.userInfo.id) {
        canUnlock = false;
      }

      if (canUnlock) {
        await this.service.version.info.updateDetail(versionId, {
          operator: {},
          updateTime: versionDetail.updateTime,
        });
      }

      return Response.success(
        {
          status: canUnlock,
          operationTime: versionOperator.contentUpdateTime || versionDetail.updateTime,
          operator: versionOperator.userInfo || {},
        },
        1161301,
      );
    } catch (err) {
      return Response.error(err, i18n.content.unlockBuildContentFailed, 3161301);
    }
  }
}
