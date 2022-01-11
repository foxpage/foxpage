import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes, FileTypes, StoreOrder } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { PRE, TAG, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AddGoodsToApplicationReq, GetStorePackageListRes } from '../../types/validates/store-validate-types';
import * as Response from '../../utils/response';
import { generationId } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('stores')
export class AddStorePackageToApplication extends BaseController {
  constructor() {
    super();
  }

  /**
   * Add store pages and template products to the specified application,
   * current only support create a reference to the package.
   * When creating referenced component information,
   * you need to add the referenced information on the label of the created component file
   * @param  {GetPageTemplateListReq} params
   * @returns {GetPageTemplateListRes}
   */
  @Post('/packages')
  @OpenAPI({
    summary: i18n.sw.addStorePackagesToApplications,
    description: '',
    tags: ['Store'],
    operationId: 'add-store-packages-to-applications',
  })
  @ResponseSchema(GetStorePackageListRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AddGoodsToApplicationReq): Promise<ResData<any>> {
    try {
      // Check permission
      const hasAuth = await Promise.all(
        params.appIds.map((appId) => this.service.auth.application(appId, { ctx })),
      );
      if (hasAuth.indexOf(false) !== -1) {
        return Response.accessDeny(i18n.system.accessDeny);
      }

      // Current only support reference
      params.delivery = TAG.DELIVERY_REFERENCE;
      if (params.delivery === TAG.DELIVERY_REFERENCE) {
        // Get goods details
        const [goodsList, appFolders] = await Promise.all([
          this.service.store.goods.getDetailByIds(params.goodsIds),
          this.service.folder.info.getAppsTypeFolderId({
            applicationIds: params.appIds,
            type: TYPE.COMPONENT as AppFolderTypes,
          }),
        ]);
        const goodsFileList = _.map(goodsList, 'details');
        const fileIds = _.map(goodsFileList, 'id');
        const fileObject = _.keyBy(goodsFileList, 'id');
        const goodsFileObject = _.keyBy(goodsList, 'details.id');

        if (fileIds.length > 0) {
          const fileList = await this.service.file.list.getDetailByIds(fileIds);
          const existFiles = await this.service.file.list.find({
            applicationId: { $in: params.appIds },
            name: { $in: _.map(fileList, 'name') },
          });

          if (existFiles.length > 0) {
            return Response.warning(
              i18n.store.appHasExistPackageNames + ':' + _.map(existFiles, 'name').join(','),
            );
          }

          let goodsOrders: StoreOrder[] = [];
          for (const appId of params.appIds) {
            // Check if there is a component with the same name under the application
            const referencedObject = await this.service.file.list.getReferencedByIds(appId, fileIds);
            for (const file of fileList) {
              if (referencedObject[file.id]) {
                // Has been referenced
                continue;
              }

              this.service.file.info.create(
                {
                  id: generationId(PRE.FILE),
                  applicationId: appId,
                  name: file.name,
                  intro: file.intro,
                  suffix: file.suffix,
                  type: TYPE.COMPONENT as FileTypes,
                  folderId: appFolders[appId] || '',
                  tags: [{ type: TAG.DELIVERY_REFERENCE, reference: fileObject[file.id] || {} }],
                  creator: ctx.userInfo.id,
                },
                { ctx },
              );

              goodsOrders.push({
                id: generationId(PRE.ORDER),
                goodsId: goodsFileObject?.[file.id]?.id || '',
                goodsVersionId: '',
                customer: {
                  id: file.id,
                  applicationId: appId,
                  userId: ctx.userInfo?.id,
                },
                delivery: TAG.DELIVERY_REFERENCE,
              });
            }
          }

          if (goodsOrders.length > 0) {
            ctx.transactions.push(this.service.store.order.addDetailQuery(goodsOrders));
          }
        }
      }

      await this.service.file.info.runTransaction(ctx.transactions);

      ctx.logAttr = Object.assign(ctx.logAttr, { id: params.goodsIds[0], type: TYPE.GOODS });

      return Response.success(i18n.store.addStorePackageToApplicationSuccess);
    } catch (err) {
      return Response.error(err, i18n.store.addStorePackageToApplicationFailed);
    }
  }
}
