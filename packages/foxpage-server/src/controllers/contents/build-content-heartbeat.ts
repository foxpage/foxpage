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
export class BuildContentHeartBeat extends BaseController {
  constructor() {
    super();
  }

  /**
   * check the version lock info
   * if last lock time over 10 min (milli sec), then clear lock user info
   * if current user is the lock user, then update lock time
   * @param  {LogBuildContentReq} params
   * @returns {LockContentDetail}
   */
  @Put('/heartbeat')
  @OpenAPI({
    summary: i18n.sw.contentBuildHeartbeat,
    description: '',
    tags: ['Content'],
    operationId: 'content-build-heartbeat',
  })
  @ResponseSchema(LockBuildContentRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: LockBuildContentReq): Promise<ResData<LockContentDetail>> {
    const { applicationId = '', contentId = '', versionId = '' } = params;

    if (!applicationId || !contentId || !versionId) {
      return Response.warning(i18n.content.invalidAppOrContentIdOrVersionId, 2161401);
    }

    try {
      const versionDetail = await this.service.version.info.getDetailById(versionId);

      if (this.notValid(versionDetail)) {
        return Response.warning(i18n.content.invalidVersionId, 2161402);
      }

      const hasAuth = await this.service.auth.version(params.versionId, { ctx });

      let canLock = false;
      const versionOperator = versionDetail.operator || {};
      const currentTime = new Date().getTime();
      if (!versionOperator.operationTime || versionOperator.operationTime + 180000 < currentTime) {
        versionOperator.userInfo = {};
        canLock = true;
      } else if (hasAuth && versionOperator.userInfo?.id && versionOperator.userInfo.id === ctx.userInfo.id) {
        canLock = true;
      }

      if (canLock && versionOperator.userInfo?.id === ctx.userInfo?.id) {
        versionOperator.operationTime = currentTime;
        await this.service.version.info.updateDetail(versionId, {
          operator: versionOperator,
          updateTime: versionDetail.updateTime,
        });
      }

      return Response.success(
        {
          status: canLock,
          lockStatus: versionOperator.userInfo && !_.isEmpty(versionOperator.userInfo),
          operationTime: versionDetail.contentUpdateTime || '',
          operator: versionOperator.userInfo || {},
        },
        1161401,
      );
    } catch (err) {
      return Response.error(err, i18n.content.unlockBuildContentFailed, 3161401);
    }
  }
}
