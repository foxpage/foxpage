import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { MemberInfo, ResData } from '../../types/index-types';
import { GetTeamMemberListReq, TeamListRes } from '../../types/validates/team-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('teams')
export class GetTeamMemberList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get a paginated list of team members
   * @param  {TeamListReq} params
   * @returns {TeamInfo}
   */
  @Get('/member-searchs')
  @OpenAPI({
    summary: i18n.sw.getTeamMemberList,
    description: '',
    tags: ['Team'],
    operationId: 'get-team-member-list',
  })
  @ResponseSchema(TeamListRes)
  async index(@QueryParams() params: GetTeamMemberListReq): Promise<ResData<MemberInfo[]>> {
    try {
      this.service.team.setPageSize(params);
      const from = (params.page - 1) * params.size;
      const teamDetail = await this.service.team.getDetailById(params.teamId);

      // Filter the effective members, get the member list of the current page number
      const allMembers = _.filter(teamDetail.members || [], ['status', true]);
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
            total: allMembers.length || 0,
            page: params.page,
            size: params.size,
          },
          data: memberList,
        },
        1020401,
      );
    } catch (err) {
      return Response.error(err, i18n.team.getTeamMemberListFailed, 3020401);
    }
  }
}
