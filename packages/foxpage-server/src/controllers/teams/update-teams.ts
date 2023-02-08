import 'reflect-metadata';

import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Team } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { TeamBaseDetailRes, UpdateTeamDetailReq } from '../../types/validates/team-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('teams')
export class UpdateTeamDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update team details, only the team name can be updated temporarily
   * @param  {UpdateTeamDetailReq} params
   * @returns {Team}
   */
  @Put('')
  @OpenAPI({
    summary: i18n.sw.updateTeamDetail,
    description: '',
    tags: ['Team'],
    operationId: 'update-team-detail',
  })
  @ResponseSchema(TeamBaseDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateTeamDetailReq): Promise<ResData<Team>> {
    try {
      // Get team details
      let teamDetail = await this.service.team.getDetailById(params.teamId);
      if (this.notValid(teamDetail)) {
        return Response.warning(i18n.team.invalidTeamId, 2020801);
      }

      // Permission check
      const hasAuth = await this.service.auth.team(params.teamId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4020801);
      }

      if (teamDetail.name !== params.name) {
        // Update team details
        await this.service.team.updateDetail(params.teamId, { name: params.name });

        // Get new team details
        teamDetail = await this.service.team.getDetailById(params.teamId);

        ctx.logAttr = Object.assign(ctx.logAttr, { id: params.teamId, type: TYPE.TEAM });

        // this.service.log.saveLog({
        //   action: LOG_UPDATE,
        //   category: { id: newTeamDetail.organizationId, type: LOG.CATEGORY_ORGANIZATION },
        //   content: { id: newTeamDetail.id, before: sourceTeamDetail, after: newTeamDetail },
        // });
      }

      return Response.success(teamDetail, 1020801);
    } catch (err) {
      return Response.error(err, i18n.team.updateTeamFailed, 3020801);
    }
  }
}
