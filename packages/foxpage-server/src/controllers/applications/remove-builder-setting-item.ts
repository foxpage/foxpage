import 'reflect-metadata';

import _ from 'lodash';
import { QueryParams, Ctx, JsonController, Delete } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { FoxCtx, ResData } from '../../types/index-types';
import { RemoveAppSettingDetailReq } from '../../types/validates/app-validate-types';
import { ResponseBase } from '../../types/validates/index-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('applications')
export class UpdateApplicationSettingDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Delete app type build setting items
   * @param  {ResponseBase} params
   * @returns Application
   */
  @Delete('/builder-setting')
  @OpenAPI({
    summary: i18n.sw.removeBuilderSetting,
    description: '',
    tags: ['Application'],
    operationId: 'remove-builder-setting',
  })
  @ResponseSchema(ResponseBase)
  async index(
    @Ctx() ctx: FoxCtx,
    @QueryParams() params: RemoveAppSettingDetailReq,
  ): Promise<ResData<string>> {
    try {
      // Permission check
      const hasAuth = await this.service.auth.application(params.applicationId, { ctx, mask: 1 });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4031301);
      }

      const appDetail = await this.service.application.getDetailById(params.applicationId);
      const appSetting = appDetail.setting || {};

      if (appSetting[params.type]) {
        const fileIds = _.map(params.fileIds.split(','), (fileId) => _.trim(fileId));
        const newTypeSetting = _.filter(appSetting[params.type], (item) => fileIds.indexOf(item.id) === -1);

        await this.service.application.updateDetail(params.applicationId, {
          ['setting.' + params.type]: newTypeSetting,
        });
      }
      return Response.success(i18n.app.removeSettingSuccess, 1031301);
    } catch (err) {
      return Response.error(err, i18n.app.removeSettingDetailFailed, 3031301);
    }
  }
}
