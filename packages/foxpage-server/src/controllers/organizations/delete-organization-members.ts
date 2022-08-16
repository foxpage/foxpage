import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Organization } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { DeleteOrgMembersReq, OrgBaseDetailRes } from '../../types/validates/org-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('organizations')
export class DeleteOrganizationMembers extends BaseController {
  constructor() {
    super();
  }

  /**
   * Delete organization member
   * @param  {AddOrgMembersReq} params
   * @returns {Organization}
   */
  @Put('/members-status')
  @OpenAPI({
    summary: i18n.sw.deleteOrgMemberDetail,
    description: '',
    tags: ['Organization'],
    operationId: 'delete-organization-member',
  })
  @ResponseSchema(OrgBaseDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: DeleteOrgMembersReq): Promise<ResData<Organization>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, {
        method: METHOD.DELETE,
        type: TYPE.ORGANIZATION,
        organizationId: params.organizationId,
      });

      // Permission check
      const hasAuth = await this.service.auth.organization(params.organizationId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4010301);
      }

      this.service.org.updateMembersStatus(params.organizationId, params.userIds, false, { ctx });
      await this.service.org.runTransaction(ctx.transactions);
      const orgInfo = await this.service.org.getDetailById(params.organizationId);

      return Response.success(orgInfo, 1010301);
    } catch (err) {
      return Response.error(err, i18n.org.deletedOrgMemberFailed, 3010301);
    }
  }
}
