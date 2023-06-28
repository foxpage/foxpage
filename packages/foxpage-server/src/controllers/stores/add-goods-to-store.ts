import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { FileTypes, StoreGoods } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { PRE, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AddGoodsToStoreReq, GetStorePackageListRes } from '../../types/validates/store-validate-types';
import * as Response from '../../utils/response';
import { generationId } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('stores')
export class AddGoodsToStore extends BaseController {
  constructor() {
    super();
  }

  /**
   * Add file to the store
   * @param  {AddGoodsToStoreReq} params
   * @returns {GetPageTemplateListRes}
   */
  @Post('/goods')
  @OpenAPI({
    summary: i18n.sw.addGoodsToStore,
    description: '',
    tags: ['Store'],
    operationId: 'add-goods-to-store',
  })
  @ResponseSchema(GetStorePackageListRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AddGoodsToStoreReq): Promise<ResData<StoreGoods>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.GOODS });

      // Check permissions
      const hasAuth = await this.service.auth.file(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4130101);
      }

      // Check if the target has been added to the store
      const [goodsDetail, fileDetail, fileContentList] = await Promise.all([
        this.service.store.goods.getDetailByTypeId(params.id),
        this.service.file.info.getDetailById(params.id),
        this.service.content.list.getFileContentList([params.id]),
      ]);

      // online
      if (goodsDetail && goodsDetail.status === 1) {
        return Response.warning(i18n.store.goodsExist, 2130101);
      }

      if (this.notValid(fileDetail)) {
        return Response.warning(i18n.store.invalidTypeId, 2130102);
      }

      const contentLiveIds = _.pull(_.map(fileContentList?.[params.id] || [], 'liveVersionId'), '');
      if (contentLiveIds.length === 0) {
        return Response.warning(i18n.store.mustHasLiveVersion, 2130103);
      }

      // Get the live version details of the target
      const dataDetail = Object.assign(
        { projectId: params.type !== TYPE.PACKAGE ? fileDetail.folderId : undefined },
        _.pick(fileDetail, ['id', 'applicationId', 'creator']),
      );

      // Up to Store
      let goodsId = goodsDetail?.id || '';

      if (goodsDetail) {
        await this.service.store.goods.updateDetail(goodsDetail.id, {
          details: dataDetail,
          status: 1,
          deleted: false,
        });
      } else {
        goodsId = generationId(PRE.STORE);
        await this.service.store.goods.addDetail({
          id: goodsId,
          name: fileDetail.name,
          intro: params.intro || '',
          type: params.type as FileTypes,
          details: dataDetail,
          status: 1,
        });
      }

      const newGoodsDetail = await this.service.store.goods.getDetailById(goodsId);

      return Response.success(newGoodsDetail, 1130101);
    } catch (err) {
      return Response.error(err, i18n.store.addGoodsToStoreFailed, 3130101);
    }
  }
}
