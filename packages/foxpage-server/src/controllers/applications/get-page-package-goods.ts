import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { ResData } from '../../types/index-types';
import { AppPackageGoodsListReq, AppPackageListRes } from '../../types/validates/app-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('applications')
export class GetApplicationPackageGoodsList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get special type paging package goods list in application
   * @param  {AppPackageGoodsListReq} params
   * @returns {GetPageTemplateListRes}
   */
  @Get('/package-goods-searchs')
  @OpenAPI({
    summary: i18n.sw.getAppPackageGoodsList,
    description: '',
    tags: ['Application'],
    operationId: 'get-application-package-goods-list',
  })
  @ResponseSchema(AppPackageListRes)
  async index(@QueryParams() params: AppPackageGoodsListReq): Promise<ResData<any>> {
    try {
      this.service.store.goods.setPageSize(params);

      // TODO need to complete

      return Response.success(
        {
          pageInfo: {
            total: 0,
            page: params.page,
            size: params.size,
          },
          data: [],
        },
        1030801,
      );
    } catch (err) {
      return Response.error(err, i18n.app.getPageGoodsFailed, 3030801);
    }
  }
}
