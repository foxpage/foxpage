import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ResData } from '../../types/index-types';
import { UserAccountInfo } from '../../types/user-types';
import { GetPageUserListReq, UserInfoRes } from '../../types/validates/user-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('user-searchs')
export class GetPageUserDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get page user detail list
   * @param  {UserListRes} params
   * @returns {}
   */
  @Get('')
  @OpenAPI({
    summary: 'Get page user list',
    description: '',
    tags: ['User'],
    operationId: 'get-page-user-list',
  })
  @ResponseSchema(UserInfoRes)
  async index(@QueryParams() params: GetPageUserListReq): Promise<ResData<UserAccountInfo[]>> {
    try {
      const pageSize = this.service.user.setPageSize(params);
      const userCountList = await this.service.user.getPageList({
        deleted: false,
        search: params.search,
        page: pageSize.page,
        size: pageSize.size,
      });

      return Response.success(
        {
          pageInfo: { page: params.page, size: params.size, total: userCountList.count },
          data: _.map(userCountList.list, (user) => _.pick(user, ['id', 'account', 'email', 'nickName'])),
        },
        1060701,
      );
    } catch (err) {
      return Response.error(err, 'Get page user list failed', 3060701);
    }
  }
}
