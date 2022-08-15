import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { UserBase } from 'src/types/user-types';

import { Application, StoreGoods } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { GetFileListReq, GetPageTemplateListRes } from '../../types/validates/store-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

interface GoodsWithAppInfo extends StoreGoods {
  details: {
    id: string;
    applicationId: string;
    applicationName?: string;
    creator?: string;
  };
  application?: Record<string, any>;
  creator: UserBase;
}

@JsonController('stores')
export class GetStoreFileGoodsList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the data of the store file goods paged list
   * @param  {GetPageTemplateListReq} params
   * @returns {GetPageTemplateListRes}
   */
  @Post('/goods-searchs')
  @OpenAPI({
    summary: i18n.sw.getStoreFileGoodsList,
    description: '',
    tags: ['Store'],
    operationId: 'get-store-file-page-list',
  })
  @ResponseSchema(GetPageTemplateListRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: GetFileListReq): Promise<ResData<GoodsWithAppInfo>> {
    try {
      this.service.store.goods.setPageSize(params);

      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.GET });

      // Get store paging data
      const pageData = await this.service.store.goods.getPageList(params);

      // Get the original application Name of the product
      const goodsList = _.cloneDeep(pageData.list) as GoodsWithAppInfo[];
      if (goodsList.length > 0) {
        const goodsDetailList = _.map(goodsList, 'details');
        const appIds: string[] = _.uniq(_.map(goodsDetailList, 'applicationId'));
        const userIds = <string[]>_.uniq(_.map(goodsDetailList, 'creator'));

        const [appList, userObject] = await Promise.all([
          this.service.application.getDetailByIds(appIds),
          this.service.user.getUserBaseObjectByIds(userIds),
        ]);
        const appObject: Record<string, Application> = _.keyBy(appList, 'id');

        goodsList.forEach((goods) => {
          if (goods.details) {
            goods.details.applicationName = appObject?.[goods.details.applicationId]?.name || '';
            goods.creator = userObject[<string>goods.details.creator] || '';
            goods.application = {
              id:  goods.details.applicationId,
              name:  goods.details.applicationName,
            };
          }
        });
      }

      return Response.success(
        {
          pageInfo: {
            total: pageData.count,
            page: params.page,
            size: params.size,
          },
          data: goodsList,
        },
        1130401,
      );
    } catch (err) {
      return Response.error(err, i18n.store.getStorePageListFailed, 3130401);
    }
  }
}
