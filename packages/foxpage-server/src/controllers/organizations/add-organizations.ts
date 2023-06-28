import 'reflect-metadata';

import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Organization } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { PRE, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { NewOrgParams } from '../../types/organization-types';
import { AddOrgDetailReq, OrgBaseDetailRes } from '../../types/validates/org-validate-types';
import * as Response from '../../utils/response';
import { generationId } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('organizations')
export class AddOrganizationDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Create organization details
   * @param  {AddOrgDetailReq} params
   * @param  {Header} headers
   * @returns {Organization}
   */
  @Post('')
  @OpenAPI({
    summary: i18n.sw.addOrgDetail,
    description: '',
    tags: ['Organization'],
    operationId: 'add-organization-detail',
  })
  @ResponseSchema(OrgBaseDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AddOrgDetailReq): Promise<ResData<Organization>> {
    try {
      const newOrganization: NewOrgParams = {
        id: generationId(PRE.ORGANIZATION),
        name: params.name,
        creator: ctx.userInfo.id,
      };

      await this.service.org.addDetail(newOrganization);

      // Get organization details
      const orgDetail = await this.service.org.getDetailById(<string>newOrganization.id);

      ctx.logAttr = Object.assign(ctx.logAttr, {
        id: newOrganization.id,
        type: TYPE.ORGANIZATION,
        organizationId: newOrganization.id,
      });

      // Save logs
      // this.service.log.saveLog({
      //   action: LOG.CREATE,
      //   category: { id: newOrganization.id, type: LOG.CATEGORY_ORGANIZATION },
      //   content: { id: newOrganization.id, contentId: '', before: {}, after: orgDetail },
      // });

      return Response.success(orgDetail, 1010201);
    } catch (err) {
      return Response.error(err, i18n.org.addOrgFailed, 3010201);
    }
  }
}
