import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { FoxCtx, ResData } from '../../types/index-types';
import { AuthDetailRes, UpdateAuthReq } from '../../types/validates/authorize-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('authorizes')
export class UpdateAuthorizeDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * update the target id auth mask
   * @param  {UpdateAuthReq} params
   * @returns {any}
   */
  @Put('')
  @OpenAPI({
    summary: i18n.sw.updateAuthorizeDetail,
    description: '',
    tags: ['Authorize'],
    operationId: 'update-authorize-detail',
  })
  @ResponseSchema(AuthDetailRes)
  async index (@Ctx() ctx: FoxCtx, @Body() params: UpdateAuthReq): Promise<ResData<any>> {
    try {
      if (!params.ids || params.ids.length === 0) {
        return Response.warning(i18n.auth.invalidAuthIds, 2180201);
      }

      const authList = await this.service.auth.getDetailByIds(params.ids);
      const authTypes = _.uniq(_.map(authList, 'type'));
      const authTypeIds = _.uniq(_.map(authList, 'typeId'));

      if (authTypes.length !== 1 || authTypeIds.length !== 1) {
        return Response.warning(i18n.auth.updateOneTypeTargetAuth, 2180202);
      }

      // check current user has auth to set or not
      const hasAuth = await this.service.auth.checkTypeIdAuthorize(
        { type: authTypes[0], typeId: authTypeIds[0] },
        { ctx, mask: 1 },
      );

      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4180201);
      }

      await this.service.auth.batchUpdateDetail(
        params.ids,
        Object.assign({ creator: ctx.userInfo.id, deleted: false }, _.pick(params, ['mask', 'allow'])),
      );

      return Response.success(i18n.auth.updateAuthorizeDetailSuccess, 1180201);
    } catch (err) {
      return Response.error(err, i18n.auth.updateAuthorizedFailed, 3180201);
    }
  }
}
