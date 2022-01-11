import 'reflect-metadata';

import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { UserRegisterRes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import * as Service from '../../services';
import { FoxCtx, ResData } from '../../types/index-types';
import { RegisterParams } from '../../types/user-types';
import { RegisterReq, RegisterRes } from '../../types/validates/user-validate-types';
import * as Response from '../../utils/response';
import { checkEmail, checkName } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('users')
export class UserRegister extends BaseController {
  constructor() {
    super();
  }

  /**
   * User registration
   * @param  {RegisterReq} params
   * @returns {User}
   */
  @Post('/register')
  @OpenAPI({
    summary: i18n.sw.userRegister,
    description: '',
    tags: ['User'],
    operationId: 'user-register',
  })
  @ResponseSchema(RegisterRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: RegisterReq): Promise<ResData<UserRegisterRes>> {
    try {
      // Check the validity of the name and email address
      if (!checkName(params.account)) {
        return Response.warning(i18n.user.invalidName);
      }

      if (!checkEmail(params.email)) {
        return Response.warning(i18n.user.invalidEmail);
      }

      // Check if the username already exists
      const userInfo: RegisterParams = {
        account: params.account,
        password: params.password,
        email: params.email || '',
        registerType: 1,
      };

      // Save new user information
      const result = await Service.user.register(userInfo, { ctx });
      if (!result.account) {
        return Response.warning(i18n.user.exist);
      }

      return Response.success(result || {});
    } catch (err) {
      return Response.error(err, i18n.user.registerFailed);
    }
  }
}
