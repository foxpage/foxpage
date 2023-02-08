import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Member, Team } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { MemberBase } from '../../types/organization-types';
import { TeamBaseDetailRes, TeamMemberDetailReq } from '../../types/validates/team-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('teams')
export class SetTeamMemberList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Team member operations, including joining and exiting
   * @param  {TeamMemberDetailReq} params
   * @returns {Team}
   */
  @Put('/members')
  @OpenAPI({
    summary: i18n.sw.teamMemberDetail,
    description: '',
    tags: ['Team'],
    operationId: 'team-member-detail',
  })
  @ResponseSchema(TeamBaseDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: TeamMemberDetailReq): Promise<ResData<Team>> {
    const newMembers: MemberBase[] = params.members || [];
    if (newMembers.length === 0) {
      return Response.warning(i18n.team.invalidMemberList, 2020701);
    }

    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.TEAM });

      // Get all members of the specified team
      const [sourceTeamDetail, sourceMembers] = await Promise.all([
        this.service.team.getDetailById(params.teamId),
        this.service.team.getMembersById(params.teamId) as Promise<Member[]>,
      ]);

      if (this.notValid(sourceTeamDetail)) {
        return Response.warning(i18n.team.invalidTeamId, 2020702);
      }

      // Permission check
      const hasAuth = await this.service.auth.team(params.teamId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4020701);
      }

      // New member data to object
      const sourceDataObject: Record<string, Member> = _.keyBy(sourceMembers, 'userId');

      // Merged member status
      newMembers.map((user) => {
        if (sourceDataObject[user.userId]) {
          sourceDataObject[user.userId].status = user.status;
        } else {
          sourceDataObject[user.userId] = _.merge(user, { joinTime: new Date() });
        }
      });

      // Update member information
      await this.service.team.updateDetail(params.teamId, {
        members: _.toArray(sourceDataObject),
      });

      // Get team details
      const teamDetail = await this.service.team.getDetailById(params.teamId);

      // this.service.log.saveLog({
      //   action: LOG_UPDATE,
      //   category: { id: teamDetail.organizationId, type: LOG.CATEGORY_ORGANIZATION },
      //   content: { id: teamDetail.id, before: sourceTeamDetail, after: teamDetail },
      // });

      return Response.success(teamDetail, 1020701);
    } catch (err) {
      return Response.error(err, i18n.team.updateTeamMemberFailed, 3020701);
    }
  }
}
