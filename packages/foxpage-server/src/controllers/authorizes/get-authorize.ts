import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { AuthInfo } from '../../types/authorize-type';
import { ResData } from '../../types/index-types';
import { AuthInfoRes, GetAuthReq } from '../../types/validates/authorize-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('authorizes')
export class GetAuthorizeDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the target id auth list
   * @param  {AuthInfoRes} params
   */
  @Get('')
  @OpenAPI({
    summary: i18n.sw.getAuthorizeList,
    description: '',
    tags: ['Authorize'],
    operationId: 'get-authorize-list',
  })
  @ResponseSchema(AuthInfoRes)
  async index(@QueryParams() params: GetAuthReq): Promise<ResData<AuthInfo[]>> {
    try {
      const authList = await this.service.auth.find(_.pick(params, ['type', 'typeId']));
      // Get user detail
      const userObject = await this.service.user.getDetailObjectByIds(_.map(authList, 'targetId'));

      let authInfoList: AuthInfo[] = [];
      authList.forEach((auth) => {
        authInfoList.push(
          Object.assign({}, _.omit(auth, ['targetId']), {
            target: _.pick(userObject[auth.targetId], ['id', 'account']),
          }) as AuthInfo,
        );
      });

      return Response.success(authInfoList, 1180401);
    } catch (err) {
      return Response.error(err, i18n.auth.addAuthorizedFailed, 3180401);
    }
  }
}
