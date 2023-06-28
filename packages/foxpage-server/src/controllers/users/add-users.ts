import 'reflect-metadata';

import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { UserRegisterType } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { FoxCtx, ResData } from '../../types/index-types';
import { AddUserResData } from '../../types/user-types';
import { AddUserReq, AddUserRes } from '../../types/validates/user-validate-types';
import * as Response from '../../utils/response';
import { randStr } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('users')
export class AddUsers extends BaseController {
  constructor() {
    super();
  }

  /**
   * The administrator manually creates a new user
   * @param  {AddUserReq} params
   * @returns {AddUserResData}
   */
  @Post('/new')
  @OpenAPI({
    summary: i18n.sw.addNewUser,
    description: '',
    tags: ['User'],
    operationId: 'add-new-user',
  })
  @ResponseSchema(AddUserRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AddUserReq): Promise<ResData<AddUserResData>> {
    try {
      // Check if the username already exists
      const userDetail = await this.service.user.getUserDetailByAccount(params.account);
      if (userDetail && userDetail.account) {
        return Response.warning(i18n.user.exist, 2060101);
      }

      const newUserParams = {
        account: params.account,
        email: params.email,
        password: randStr(10),
        registerType: 1 as UserRegisterType,
        changePwdStatus: true,
      };
      const userId = this.service.user.addNewUser(newUserParams, { ctx });
      this.service.org.addNewMembers(params.organizationId, [userId], { ctx });

      await this.service.org.runTransaction(ctx.transactions);

      return Response.success(
        {
          account: params.account,
          email: params.email,
          password: newUserParams.password,
        },
        1060101,
      );
    } catch (err) {
      return Response.error(err, i18n.user.loginFailed, 3060101);
    }
  }
}
