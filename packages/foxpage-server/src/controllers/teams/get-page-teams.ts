import 'reflect-metadata';

import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { ResData } from '../../types/index-types';
import { TeamInfo } from '../../types/team-types';
import { TeamListReq, TeamListRes } from '../../types/validates/team-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('team-searchs')
export class GetTeamList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get paging team list (under the organization)
   * @param  {TeamListReq} params
   * @returns {TeamInfo}
   */
  @Get('')
  @OpenAPI({
    summary: i18n.sw.teamList,
    description: '',
    tags: ['Team'],
    operationId: 'get-team-list',
  })
  @ResponseSchema(TeamListRes)
  async index(@QueryParams() params: TeamListReq): Promise<ResData<TeamInfo[]>> {
    try {
      this.service.team.setPageSize(params);
      const teamPageList = await this.service.team.getPageList(params);

      return Response.success(
        {
          pageInfo: {
            total: teamPageList.count,
            page: params.page,
            size: params.size,
          },
          data: teamPageList.list,
        },
        1020401,
      );
    } catch (err) {
      return Response.error(err, i18n.team.getTeamListFailed, 3020401);
    }
  }
}
