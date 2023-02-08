import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Authorize } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { PRE, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AddAuthReq, AuthDetailRes } from '../../types/validates/authorize-validate-types';
import * as Response from '../../utils/response';
import { generationId } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('authorizes')
export class AddAuthorizeDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Add the target id auth mask
   * @param  {AddAuthReq} params
   * @returns {AppWithFolder}
   */
  @Post('')
  @OpenAPI({
    summary: i18n.sw.addAuthorizeDetail,
    description: '',
    tags: ['Authorize'],
    operationId: 'add-authorize-detail',
  })
  @ResponseSchema(AuthDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AddAuthReq): Promise<ResData<string>> {
    try {
      if (params.type !== TYPE.SYSTEM && !params.typeId) {
        return Response.warning(i18n.auth.invalidTypeId, 2180101);
      }

      // check current user has auth to set or not
      const hasAuth = await this.service.auth.checkTypeIdAuthorize(_.pick(params, ['type', 'typeId']), {
        ctx,
        mask: 1,
      });

      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4180101);
      }

      // check exist data
      const [existTargets, typeRelation] = await Promise.all([
        this.service.auth.find({
          type: params.type,
          typeId: params.typeId,
          targetId: { $in: params.targetIds },
        }),
        this.service.auth.getTargetRelation(params.type, [params.typeId]),
      ]);

      const authTargetIds = _.map(existTargets, 'targetId');
      const newTargetIds = _.pullAll(params.targetIds, authTargetIds);

      if (newTargetIds.length > 0) {
        let typeAuthList: Authorize[] = [];
        for (const targetId of newTargetIds) {
          typeAuthList.push({
            id: generationId(PRE.AUTH),
            type: params.type,
            typeId: params.typeId,
            targetId: targetId,
            mask: params.mask || 0,
            allow: !_.isNil(params.allow) ? params.allow : true,
            relation: typeRelation[params.typeId] || {},
            creator: ctx.userInfo.id || '',
          });
        }
        ctx.transactions.push(this.service.auth.addDetailQuery(typeAuthList));
      }

      // Update exist auth data
      if (authTargetIds.length > 0) {
        ctx.transactions.push(
          this.service.auth.batchUpdateDetailQuery({ id: { $in: _.map(existTargets, 'id') } }, {
            $set: {
              mask: params.mask || 0,
              allow: !_.isNil(params.allow) ? params.allow : true,
              deleted: false,
            },
          } as any),
        );
      }

      await this.service.auth.runTransaction(ctx.transactions);

      return Response.success(i18n.auth.addAuthorizeDetailSuccess, 1180101);
    } catch (err) {
      return Response.error(err, i18n.auth.addAuthorizedFailed, 3180101);
    }
  }
}
