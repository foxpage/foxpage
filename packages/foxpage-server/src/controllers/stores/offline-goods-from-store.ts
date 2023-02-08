import 'reflect-metadata';

import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { StoreGoods } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { GetStorePackageListRes, OfflineGoodsFromStoreReq } from '../../types/validates/store-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('stores')
export class OfflineGoodsFromStore extends BaseController {
  constructor() {
    super();
  }

  /**
   * Remove the product from the store
   * @param  {OfflineGoodsFromStoreReq} params
   * @returns {GetPageTemplateListRes}
   */
  @Put('/goods-offline')
  @OpenAPI({
    summary: i18n.sw.offlineGoodsFromStore,
    description: '',
    tags: ['Store'],
    operationId: 'offline-goods-from-store',
  })
  @ResponseSchema(GetStorePackageListRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: OfflineGoodsFromStoreReq): Promise<ResData<StoreGoods>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.GOODS });

      // Check offline permission
      const hasAuth = await this.service.auth.file(params.id, { ctx, mask: 1 });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4130701);
      }

      // Get product details
      let goodsDetail = await this.service.store.goods.getDetailByAppFileId(params.applicationId, params.id);

      if (this.notValid(goodsDetail)) {
        return Response.warning(i18n.store.invalidTypeId, 2130701);
      }

      // Set the status of the product to be off the shelf
      await this.service.store.goods.updateDetail(goodsDetail.id, { status: 0 });
      goodsDetail = await this.service.store.goods.getDetailById(goodsDetail.id);

      return Response.success(goodsDetail, 1130701);
    } catch (err) {
      return Response.error(err, i18n.store.offlineGoodsFromStoreFailed, 3130701);
    }
  }
}
