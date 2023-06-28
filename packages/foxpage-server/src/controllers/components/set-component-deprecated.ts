import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

// import { File } from '@foxpage/foxpage-server-types';
import { i18n } from '../../../app.config';
import { TAG, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { SetComponentDeprecatedReq } from '../../types/validates/component-validate-types';
import { FileDetailRes } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('components')
export class SetComponentDeprecatedStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the component deprecated status to true or false
   * the deprecated component must offline from store
   * @param  {SetComponentDeprecatedReq} params
   * @returns {Content}
   */
  @Put('/deprecated')
  @OpenAPI({
    summary: i18n.sw.setComponentDeprecated,
    description: '',
    tags: ['Component'],
    operationId: 'set-component-deprecated',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: SetComponentDeprecatedReq): Promise<ResData<any>> {
    const { applicationId = '', id = '' } = params;

    try {
      if (_.isNil(params.status)) {
        return Response.warning(i18n.component.invalidDeprecatedStatus, 2113101);
      }

      // Permission check
      const hasAuth = await this.service.auth.application(applicationId, { ctx, mask: 1 });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4111401);
      }

      const [componentDetail, storeComponentDetail] = await Promise.all([
        this.service.file.info.getDetailById(id),
        this.service.store.goods.getDetailByTypeId(id),
      ]);

      if (
        this.notValid(componentDetail) ||
        componentDetail.type !== TYPE.COMPONENT ||
        componentDetail.applicationId !== applicationId
      ) {
        return Response.warning(i18n.component.invalidComponentIdOrAppId, 2113102);
      }

      if (params.status && !this.notValid(storeComponentDetail) && storeComponentDetail.status !== 0) {
        return Response.warning(i18n.component.offlineBeforeDeprecated, 2113103);
      }

      // update component deprecated status
      const componentTags = _.filter(componentDetail.tags || [], (tag) => tag.type !== TAG.DEPRECATED);
      await this.service.file.info.updateDetail(params.id, {
        tags: _.concat(componentTags, [{ type: TAG.DEPRECATED, status: params.status }]),
      });

      return Response.success(i18n.component.setDeprecatedStatusSuccess, 1113101);
    } catch (err) {
      return Response.error(err, i18n.component.setDeprecatedStatusFailed, 3113101);
    }
  }
}
