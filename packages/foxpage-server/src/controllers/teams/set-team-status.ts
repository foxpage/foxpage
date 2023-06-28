import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Member, Team } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { TeamBaseDetailRes, TeamStatusReq } from '../../types/validates/team-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('teams')
export class UpdateTeamDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set team deletion status
   * @param  {TeamStatusReq} params
   * @returns {Team}
   */
  @Put('/status')
  @OpenAPI({
    summary: i18n.sw.deleteTeamDeleteDetail,
    description: '',
    tags: ['Team'],
    operationId: 'set-team-status',
  })
  @ResponseSchema(TeamBaseDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: TeamStatusReq): Promise<ResData<Team>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.DELETE, type: TYPE.TEAM });

      // Get team details
      const sourceTeamDetail = await this.service.team.getDetailById(params.teamId);
      if (this.notValid(sourceTeamDetail)) {
        return Response.warning(i18n.team.invalidTeamId, 2020601);
      }

      // Permission check
      const hasAuth = await this.service.auth.team(params.teamId, { ctx, mask: 1 });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4020601);
      }

      // TODO: Check whether the pre-conditions are met,
      // the current condition is that there are no members under the team
      let validUsers: Member | undefined = undefined;
      if (sourceTeamDetail.members && sourceTeamDetail.members.length > 0) {
        validUsers = _.find(sourceTeamDetail.members, { status: true });
      }

      if (validUsers) {
        return Response.warning(i18n.team.memberNotEmpty, 2020602);
      }

      // Set deletion status
      const status = _.isNil(params.status) ? !!params.status : true;
      await this.service.team.updateDetail(params.teamId, { deleted: status });

      const teamDetail = await this.service.team.getDetailById(params.teamId);

      return Response.success(teamDetail, 1020601);
    } catch (err) {
      return Response.error(err, i18n.team.updateTeamFailed, 3020601);
    }
  }
}
