import 'reflect-metadata';

import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { ResData } from '../../types/index-types';
import { OrgInfo } from '../../types/organization-types';
import { OrgListReq, OrgListRes } from '../../types/validates/org-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('organization-searchs')
export class GetOrgList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get a list of organizations
   * @param  {OrgListReq} params
   * @returns {OrgInfo}
   */
  @Get('')
  @OpenAPI({
    summary: i18n.sw.orgList,
    description: '',
    tags: ['Organization'],
    operationId: 'get-page-organization-list',
  })
  @ResponseSchema(OrgListRes)
  async index(@QueryParams() params: OrgListReq): Promise<ResData<OrgInfo[]>> {
    try {
      const orgPageList = await this.service.org.getPageList(params);

      return Response.success(orgPageList, 1010601);
    } catch (err) {
      return Response.error(err, i18n.org.getOrgListFailed, 3010601);
    }
  }
}
