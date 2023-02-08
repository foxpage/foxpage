import 'reflect-metadata';

import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Organization } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { OrgBaseDetailRes, OrgUpdateDetailReq } from '../../types/validates/org-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('organizations')
export class UpdateOrganizationDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update organization details, only the name will be updated for the time being
   * @param  {OrgUpdateDetailReq} params
   * @returns {Organization}
   */
  @Put('')
  @OpenAPI({
    summary: i18n.sw.updateOrgDetail,
    description: '/organization/detail',
    tags: ['Organization'],
    operationId: 'update-organization-detail',
  })
  @ResponseSchema(OrgBaseDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: OrgUpdateDetailReq): Promise<ResData<Organization>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, {
        type: TYPE.ORGANIZATION,
        organizationId: params.organizationId,
      });

      // Check if the organization exists
      let orgDetail = await this.service.org.getDetailById(params.organizationId);

      if (this.notValid(orgDetail)) {
        return Response.warning(i18n.org.invalidOrgId, 2010901);
      }

      const hasAuth = await this.service.auth.organization(params.organizationId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4010901);
      }

      // Update
      await this.service.org.updateDetail(params.organizationId, { name: params.name });

      // Get the latest details
      const newOrgDetail = await this.service.org.getDetailById(params.organizationId);

      // this.service.log.saveLog({
      //   action: LOG_UPDATE,
      //   category: { id: params.id, type: LOG.CATEGORY_ORGANIZATION },
      //   content: { id: params.id, contentId: '', before: orgDetail, after: newOrgDetail },
      // });

      return Response.success(newOrgDetail, 1010901);
    } catch (err) {
      return Response.error(err, i18n.org.updateOrgFailed, 3010901);
    }
  }
}
