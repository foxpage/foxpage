import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { PRE, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AddOrgMembersReq, OrgBaseDetailRes } from '../../types/validates/org-validate-types';
import * as Response from '../../utils/response';
import { generationId, randStr } from '../../utils/tools';
import { BaseController } from '../base-controller';

interface NewUserBase {
  id: string;
  account: string;
  password: string;
}

@JsonController('organizations')
export class AddOrganizationMembers extends BaseController {
  constructor() {
    super();
  }

  /**
   * Add organization members
   * @param  {AddOrgMembersReq} params
   * @returns {Organization}
   */
  @Post('/members')
  @OpenAPI({
    summary: i18n.sw.addOrgMemberDetail,
    description: '',
    tags: ['Organization'],
    operationId: 'update-organization-member-detail',
  })
  @ResponseSchema(OrgBaseDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AddOrgMembersReq): Promise<ResData<NewUserBase>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, {
        type: TYPE.ORGANIZATION,
        organizationId: params.organizationId,
      });

      // Permission check
      const hasAuth = await this.service.auth.organization(params.organizationId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny);
      }

      // Check if the user already exists
      const userInfo = await this.service.user.getUserDetailByAccount(params.account);
      if (userInfo.id) {
        return Response.warning(i18n.user.exist);
      }

      // Create new user
      const userId = generationId(PRE.USER);
      const userPwd = randStr(10);
      this.service.user.addNewUser(
        {
          id: userId,
          account: params.account,
          email: '',
          nickName: '',
          registerType: 1,
          deleted: false,
          changePwdStatus: true, // You need to update your password the first time you log in
          password: userPwd,
        },
        { ctx },
      );

      // Add users to the organization
      this.service.org.addNewMembers(params.organizationId, [userId], { ctx });

      await this.service.org.runTransaction(ctx.transactions);

      return Response.success({ id: userId, account: params.account, password: userPwd });
    } catch (err) {
      return Response.error(err, i18n.org.addOrgMemberFailed);
    }
  }
}
