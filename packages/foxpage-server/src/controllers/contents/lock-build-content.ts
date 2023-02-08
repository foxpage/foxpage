import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { VERSION } from '../../../config/constant';
import { LockContentDetail } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { UserBase } from '../../types/user-types';
import { LockBuildContentReq, LockBuildContentRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('contents')
export class LockBuildContent extends BaseController {
  constructor() {
    super();
  }

  /**
   * lock the version build data with current user
   * if lock success, set reponse field `status` to true
   * @param  {LogBuildContentReq} params
   * @returns {LockContentResDetail}
   */
  @Put('/lock')
  @OpenAPI({
    summary: i18n.sw.lockBuildContent,
    description: '',
    tags: ['Content'],
    operationId: 'lock-build-content',
  })
  @ResponseSchema(LockBuildContentRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: LockBuildContentReq): Promise<ResData<LockContentDetail>> {
    const { applicationId = '', contentId = '', versionId = '' } = params;

    if (!applicationId || !contentId || !versionId) {
      return Response.warning(i18n.content.invalidAppOrContentIdOrVersionId, 2161201);
    }

    try {
      const hasAuth = await this.service.auth.version(params.versionId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4161201);
      }

      const [versionDetail, userDetail] = await Promise.all([
        this.service.version.info.getDetailById(versionId),
        this.service.user.getDetailById(ctx.userInfo.id),
      ]);
      if (this.notValid(versionDetail) || versionDetail.status !== VERSION.STATUS_BASE) {
        return Response.warning(i18n.content.unEditedStatus, 2161202);
      }

      let canLock = true;
      let userInfo: Partial<UserBase> = {};
      let operationTime: number = 0;
      let currentTime = new Date().getTime();
      const versionOperator = versionDetail.operator || {};
      if (
        versionOperator.userInfo?.id &&
        versionOperator.userInfo.id !== ctx.userInfo.id &&
        versionOperator.operationTime + 180000 > currentTime
      ) {
        userInfo = versionOperator.userInfo || {};
        operationTime = versionOperator.operationTime;
        canLock = false;
      }

      if (canLock) {
        userInfo = _.pick(userDetail, ['id', 'account', 'email', 'nickName']);
        operationTime = currentTime;
        await this.service.version.info.updateDetail(versionId, {
          operator: { operationTime, userInfo },
          updateTime: versionDetail.updateTime,
        });
      }

      return Response.success(
        {
          status: canLock,
          operationTime: versionDetail.contentUpdateTime || versionDetail.updateTime,
          operator: userInfo,
        },
        1161201,
      );
    } catch (err) {
      return Response.error(err, i18n.content.lockBuildContentFailed, 3161201);
    }
  }
}
