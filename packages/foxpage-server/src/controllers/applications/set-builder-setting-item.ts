import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppSettingDetailReq } from '../../types/validates/app-validate-types';
import { ResponseBase } from '../../types/validates/index-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('applications')
export class UpdateApplicationSettingDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update application builder setting detail
   * @param  {ResponseBase} params
   * @returns Application
   */
  @Put('/builder-setting')
  @OpenAPI({
    summary: i18n.sw.updateBuilderSetting,
    description: '',
    tags: ['Application'],
    operationId: 'update-builder-setting',
  })
  @ResponseSchema(ResponseBase)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppSettingDetailReq): Promise<ResData<string>> {
    try {
      // Permission check
      const hasAuth = await this.service.auth.application(params.applicationId, { ctx, mask: 1 });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4031201);
      }

      // Check setting type id
      const typeList = await this.service.file.list.find({
        id: { $in: _.map(params.setting, 'id') },
        deleted: false,
      });
      const invalidType = _.find(typeList, (type) => type.type !== params.type);

      if (invalidType) {
        return Response.warning(i18n.app.invalidType, 2031201);
      }

      const itemFileIds = _.map(params.setting, 'id');
      const [settingItemDetail, hasLiveFileIds] = await Promise.all([
        this.service.application.getDetailById(params.applicationId),
        this.service.file.check.checkFileHasLiveContent(itemFileIds),
      ]);
      const typeSettingList = settingItemDetail.setting?.[params.type] || [];

      // check item has live version
      if (_.difference(itemFileIds, hasLiveFileIds).length > 0) {
        const invalidItems = _.filter(params.setting, item => 
          _.difference(itemFileIds, hasLiveFileIds).indexOf(item.id) !== -1
        );
        return Response.warning(i18n.app.itemHasNoLiveVersion + ': ' + _.map(invalidItems, 'name'), 2031202);
      }

      for (const item of params.setting) {
        const itemDetail: Record<string, any> = _.find(typeSettingList, { id: item.id });
        if (!itemDetail || _.isEmpty(itemDetail)) {
          this.service.application.addAppSetting(
            {
              applicationId: params.applicationId,
              type: params.type,
              typeId: item.id,
              typeName: item.name || '',
              typeStatus: item.status || false,
              category: item.category || {},
              defaultValue: item.defaultValue || {},
            },
            { ctx },
          );
        } else {
          this.service.application.updateAppSetting(
            {
              applicationId: params.applicationId,
              type: params.type,
              typeId: item.id,
              setting: Object.assign({}, item, {
                name: item.name || itemDetail.name,
                category: item.category || itemDetail.category,
                defaultValue: item.defaultValue || itemDetail.defaultValue || {},
                status: !_.isNil(item.status) ? item.status : itemDetail.status,
              }),
            },
            itemDetail,
            { ctx },
          );
        }
      }

      await this.service.application.runTransaction(ctx.transactions);

      return Response.success(i18n.app.updateSettingDetailSuccess, 1031201);
    } catch (err) {
      return Response.error(err, i18n.app.updateSettingDetailFailed, 3031201);
    }
  }
}
