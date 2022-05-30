import 'reflect-metadata';

import { Ctx, Get, JsonController } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { FoxCtx, IdName, ResData } from '../../types/index-types';
import { OrgListRes } from '../../types/validates/org-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('organizations')
export class GetUserOrgList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the user authorized organization list
   * @returns {IdName[]}
   */
  @Get('/by-user')
  @OpenAPI({
    summary: i18n.sw.userOrgList,
    description: '',
    tags: ['Organization'],
    operationId: 'get-user-organization-list',
  })
  @ResponseSchema(OrgListRes)
  async index (@Ctx() ctx: FoxCtx): Promise<ResData<IdName[]>> {
    try {
      if (!ctx.userInfo?.id) {
        return Response.warning(i18n.user.invalidUser, 2011001);
      }

      const userOrgList = await this.service.org.getUserOrg(ctx.userInfo.id);

      return Response.success(userOrgList, 1011001);
    } catch (err) {
      return Response.error(err, i18n.org.getOrgListFailed, 3011001);
    }
  }
}
