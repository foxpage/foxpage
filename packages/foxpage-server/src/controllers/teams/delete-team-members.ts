import 'reflect-metadata';

import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Team } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AddDeleteTeamMembers, TeamBaseDetailRes } from '../../types/validates/team-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('teams')
export class DeleteTeamMemberList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Remove team members
   * @param  {AddDeleteTeamMembers} params
   * @returns {Team}
   */
  @Put('/members-status')
  @OpenAPI({
    summary: i18n.sw.deleteTeamMembers,
    description: '',
    tags: ['Team'],
    operationId: 'delete-team-members',
  })
  @ResponseSchema(TeamBaseDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AddDeleteTeamMembers): Promise<ResData<Team>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.TEAM });

      // Permission check
      const hasAuth = await this.service.auth.team(params.teamId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4020301);
      }

      this.service.team.updateMembersStatus(params.teamId, params.userIds, { ctx, status: false });
      await this.service.team.runTransaction(ctx.transactions);
      const teamInfo = await this.service.team.getDetailById(params.teamId);

      return Response.success(teamInfo, 1020301);
    } catch (err) {
      return Response.error(err, i18n.team.updateTeamMemberFailed, 3020301);
    }
  }
}
