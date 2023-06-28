import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes, StoreGoods, StoreOrder } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { PRE, TAG, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import {
  AddGoodsItemTpApplicationReq,
  GetPageTemplateListRes,
} from '../../types/validates/store-validate-types';
import * as Response from '../../utils/response';
import { generationId } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('stores')
export class AddStorePageItemToApplication extends BaseController {
  constructor() {
    super();
  }

  /**
   * Add the store variable, condition, function products to the specified application
   * @param  {GetPageTemplateListReq} params
   * @returns {GetPageTemplateListRes}
   */
  @Post('/items')
  @OpenAPI({
    summary: i18n.sw.addStorePagesToApplications,
    description: '',
    tags: ['Store'],
    operationId: 'add-store-pages-item-to-applications',
  })
  @ResponseSchema(GetPageTemplateListRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: AddGoodsItemTpApplicationReq,
  ): Promise<ResData<StoreOrder[]>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.RESOURCE });

      // Check permission
      const hasAuth = await Promise.all(
        params.appIds.map((appId) => this.service.auth.application(appId, { ctx })),
      );
      if (hasAuth.indexOf(false) !== -1) {
        return Response.accessDeny(i18n.system.accessDeny, 4130301);
      }

      // Check the status of the goods
      const goodsList = await this.service.store.goods.getDetailByIds(params.goodsIds);
      if (goodsList.length === 0) {
        return Response.warning(i18n.store.invalidGoodsIds, 2130301);
      }

      const invalidGoods = _.filter(goodsList, (goods) => {
        return goods.status === 0 || goods.deleted;
      });

      if (invalidGoods.length > 0) {
        return Response.warning(i18n.store.invalidGoods + _.map(invalidGoods, 'name').join(','), 2130302);
      }

      // Get the file details corresponding to the goods
      const goodsFileIds = _.map(_.map(goodsList, 'details'), 'id');
      const goodsFileObject = _.keyBy(goodsList, 'details.id');
      const goodsFileList = await this.service.file.list.getDetailByIds(goodsFileIds);
      const appTypeFolderObject = await this.service.folder.info.getAppsTypeFolderId({
        applicationIds: params.appIds,
        type: params.type as AppFolderTypes,
      });

      // Add the file corresponding to the goods to the application
      let goodsOrders: StoreOrder[] = [];
      for (const file of goodsFileList) {
        for (const appId of params.appIds) {
          // Create file, content, version
          await this.service.file.info.copyFile(file.id, appId, {
            ctx,
            folderId: appTypeFolderObject[appId],
            hasLive: true,
            setLive: true,
            addToSetting: true,
          });

          // Add goods order
          goodsOrders.push({
            id: generationId(PRE.ORDER),
            goodsId: (goodsFileObject?.[file.id] as StoreGoods)?.id || '',
            goodsVersionId: '',
            customer: {
              id: file.id,
              applicationId: appId,
              userId: ctx.userInfo.id,
            },
            delivery: TAG.DELIVERY_CLONE,
          });
        }
      }

      if (goodsOrders.length > 0) {
        ctx.transactions.push(this.service.store.order.addDetailQuery(goodsOrders));
      }

      await this.service.store.goods.runTransaction(ctx.transactions);

      return Response.success(i18n.store.addGoodsToAppSuccess, 1130301);
    } catch (err) {
      return Response.error(err, i18n.store.addStorePageToApplicationFailed, 3130301);
    }
  }
}
