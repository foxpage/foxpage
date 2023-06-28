import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Folder, StoreGoods } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { GetPackageListReq, GetPageTemplateListRes } from '../../types/validates/store-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

interface ProjectGoodsInfo extends Folder {
  files: StoreGoods[];
  applicationName: string;
}

@JsonController('stores')
export class GetStorePackageList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the pagination data of store packages
   * @param  {GetPackageListReq} params
   * @returns {GetPageTemplateListRes}
   */
  @Post('/package-searchs')
  @OpenAPI({
    summary: i18n.sw.getStorePackageList,
    description: '',
    tags: ['Store'],
    operationId: 'get-store-package-page-list',
  })
  @ResponseSchema(GetPageTemplateListRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: GetPackageListReq): Promise<ResData<ProjectGoodsInfo>> {
    try {
      this.service.store.goods.setPageSize(params);
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.GET });

      if (!params.type) {
        params.type = TYPE.PACKAGE;
      }

      // Get store paging data
      const pageData = await this.service.store.goods.getPageList(params);
      const pagePackageList = pageData.list as StoreGoods[];

      let packageList: any[] = [];
      if (pagePackageList.length > 0) {
        let userIds: string[] = [];
        let applicationIds: string[] = [];
        pagePackageList &&
          pagePackageList.forEach((pkg) => {
            userIds.push(pkg?.details?.creator || '');
            applicationIds.push(pkg?.details?.applicationId || '');
          });

        const [userObject, applicationList] = await Promise.all([
          this.service.user.getUserBaseObjectByIds(userIds),
          this.service.application.getDetailByIds(applicationIds),
        ]);
        const applicationObject = _.keyBy(applicationList, 'id');

        pagePackageList.forEach((pkg) => {
          packageList.push(
            Object.assign(
              {
                application: _.pick(applicationObject[pkg.details.applicationId] || {}, ['id', 'name']),
                creator: userObject[pkg.details?.creator || ''] || {},
              },
              pkg,
            ),
          );
        });
      }

      return Response.success(
        {
          pageInfo: {
            total: pageData.count || 0,
            page: params.page,
            size: params.size,
          },
          data: packageList || [],
        },
        1130501,
      );
    } catch (err) {
      return Response.error(err, i18n.store.getStorePageListFailed, 3130501);
    }
  }
}
