import 'reflect-metadata';

import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Team } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { PRE, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { NewTeamParams } from '../../types/team-types';
import { AddTeamDetailReq, TeamBaseDetailRes } from '../../types/validates/team-validate-types';
import * as Response from '../../utils/response';
import { generationId } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('teams')
export class AddTeamDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Create team details
   * @param  {AddTeamDetailReq} params
   * @param  {Header} headers
   * @returns {Team}
   */
  @Post('')
  @OpenAPI({
    summary: i18n.sw.addTeamDetail,
    description: '',
    tags: ['Team'],
    operationId: 'add-team-detail',
  })
  @ResponseSchema(TeamBaseDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AddTeamDetailReq): Promise<ResData<Team>> {
    try {
      // TODO Check permissions

      // Check if the same team exists under the same organization
      const teamExist = await this.service.team.checkTeamExist(params);
      if (teamExist) {
        return Response.warning(i18n.team.nameExist, 2020201);
      }

      // Create team info
      const newTeam: NewTeamParams = {
        id: generationId(PRE.TEAM),
        name: params.name,
        organizationId: params.organizationId,
        creator: ctx.userInfo.id,
      };
      await this.service.team.addDetail(newTeam);

      // Get team details
      const teamDetail = await this.service.team.getDetailById(<string>newTeam.id);

      ctx.logAttr = Object.assign(ctx.logAttr, { id: <string>newTeam.id, type: TYPE.TEAM });

      // Save log
      // this.service.log.saveLog({
      //   action: LOG.CREATE,
      //   category: { id: params.organizationId, type: LOG.CATEGORY_ORGANIZATION },
      //   content: { id: newTeam.id, contentId: '', before: {}, after: teamDetail },
      // });

      return Response.success(teamDetail, 1020201);
    } catch (err) {
      return Response.error(err, i18n.team.addTeamFailed, 3020201);
    }
  }
}
