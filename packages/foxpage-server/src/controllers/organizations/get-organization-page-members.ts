import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { MemberInfo, ResData } from '../../types/index-types';
import { GetOrgMembersReq, OrgDetailRes } from '../../types/validates/org-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('organizations')
export class GetOrganizationPageMemberList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get a paginated list of organization members
   * @param  {OrgDetailReq} params
   * @returns {OrgInfo}
   */
  @Get('/member-searchs')
  @OpenAPI({
    summary: i18n.sw.getOrgPageMembersList,
    description: '',
    tags: ['Organization'],
    operationId: 'get-organization-page-members-list',
  })
  @ResponseSchema(OrgDetailRes)
  async index(@QueryParams() params: GetOrgMembersReq): Promise<ResData<MemberInfo[]>> {
    try {
      this.service.org.setPageSize(params);
      const from = (params.page - 1) * params.size;
      const orgDetail = await this.service.org.getDetailById(params.organizationId);

      // Filter the effective members, get the member list of the current page number
      const allMembers = _.filter(orgDetail.members || [], ['status', true]);
      const pageMembers = _.slice(allMembers, from, from + params.size);

      let memberList: MemberInfo[] = [];
      if (pageMembers.length > 0) {
        const memberObject = await this.service.user.getUserBaseObjectByIds(_.map(pageMembers, 'userId'));
        memberList = pageMembers.map((member) => {
          return Object.assign({ account: memberObject[member.userId]?.account || '' }, member);
        });
      }

      return Response.success(
        {
          pageInfo: {
            page: params.page || 1,
            size: params.size || 20,
            total: allMembers.length || 0,
          },
          data: memberList || [],
        },
        1010401,
      );
    } catch (err) {
      return Response.error(err, i18n.org.getOrgMemberListFailed, 3010401);
    }
  }
}
