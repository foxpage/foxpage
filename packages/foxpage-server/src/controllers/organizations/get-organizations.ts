import 'reflect-metadata';

import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { ResData } from '../../types/index-types';
import { OrgInfo } from '../../types/organization-types';
import { OrgDetailReq, OrgDetailRes } from '../../types/validates/org-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('organizations')
export class GetOrganizationList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get organization details
   * @param  {OrgDetailReq} params
   * @returns {OrgInfo}
   */
  @Get('')
  @OpenAPI({
    summary: i18n.sw.getOrgDetail,
    description: '',
    tags: ['Organization'],
    operationId: 'get-organization-detail',
  })
  @ResponseSchema(OrgDetailRes)
  async index(@QueryParams() params: OrgDetailReq): Promise<ResData<OrgInfo>> {
    try {
      const orgDetail = await this.service.org.getDetailById(params.id);
      if (this.notValid(orgDetail)) {
        return Response.warning(i18n.org.invalidOrgId, 2010501);
      }

      // TODO Check if the current user is in the organization

      // Get information about users and organization creators under the organization
      const orgDetailWithUser = await this.service.org.replaceOrgUserInfo([orgDetail]);

      return Response.success(orgDetailWithUser[0] || {}, 1010501);
    } catch (err) {
      return Response.error(err, i18n.org.getOrgDetailFailed, 3010501);
    }
  }
}
