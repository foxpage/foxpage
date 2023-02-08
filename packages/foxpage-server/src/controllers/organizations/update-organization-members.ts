import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Member, Organization } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { MemberBase } from '../../types/organization-types';
import { OrgBaseDetailRes, OrgMemberDetailReq } from '../../types/validates/org-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('organizations')
export class SetOrganizationMemberList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Organization member operations, including joining and exiting
   * @param  {OrgMemberDetailReq} params
   * @returns {Organization}
   */
  @Put('/members')
  @OpenAPI({
    summary: i18n.sw.orgMemberDetail,
    description: '/organization/members',
    tags: ['Organization'],
    operationId: 'update-organization-member-detail',
  })
  @ResponseSchema(OrgBaseDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: OrgMemberDetailReq): Promise<ResData<Organization>> {
    const newMembers: MemberBase[] = params.members || [];
    if (newMembers.length === 0) {
      return Response.warning(i18n.org.invalidMemberList, 2010801);
    }

    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.ORGANIZATION, params: params.organizationId });

      // Permission check
      const hasAuth = await this.service.auth.organization(params.organizationId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4010801);
      }

      const userIds = _.map(params.members, 'userId');

      // Get all members of the specified organization
      const [sourceOrgDetail, userObject] = await Promise.all([
        this.service.org.getDetailById(params.organizationId),
        this.service.user.getUserBaseObjectByIds(userIds),
      ]);

      if (this.notValid(sourceOrgDetail)) {
        return Response.warning(i18n.org.invalidOrgId, 2010802);
      }

      const sourceMembers = sourceOrgDetail?.members || [];

      // New member data to object
      const sourceDataObject: Record<string, Member> = _.keyBy(sourceMembers, 'userId');

      // Merged member status
      newMembers.map((user) => {
        if (sourceDataObject[user.userId]) {
          sourceDataObject[user.userId].status = user.status;
        } else {
          sourceDataObject[user.userId] = _.merge(user, {
            account: userObject[user.userId] || '',
            joinTime: new Date(),
          });
        }
      });

      // Update member information
      await this.service.org.updateDetail(params.organizationId, { members: _.toArray(sourceDataObject) });

      // Get organization details
      const orgDetail = await this.service.org.getDetailById(params.organizationId);

      // this.service.log.saveLog({
      //   action: LOG_UPDATE,
      //   category: { id: params.id, type: LOG.CATEGORY_ORGANIZATION },
      //   content: { id: params.id, contentId: '', before: sourceOrgDetail, after: orgDetail },
      // });

      return Response.success(orgDetail, 1010801);
    } catch (err) {
      return Response.error(err, i18n.org.updateOrgMemberFailed, 3010801);
    }
  }
}
