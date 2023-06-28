import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentOfflineReq, ContentDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController()
export class SetPageContentOffline extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the page content to offline
   * check content in store or extend by other content
   * @param  {AppContentOfflineReq} params
   * @returns {Content}
   */
  @Put('pages/content-offline')
  @Put('templates/content-offline')
  @Put('blocks/content-offline')
  @OpenAPI({
    summary: i18n.sw.setPageContentOffline,
    description: '',
    tags: ['Page'],
    operationId: 'set-page-offline',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentOfflineReq): Promise<ResData<Content>> {
    try {
      const apiType = this.getRoutePath(ctx.request.url);
      ctx.logAttr = Object.assign(ctx.logAttr, { type: apiType });

      const [hasAuth, contentDetail] = await Promise.all([
        this.service.auth.content(params.id, { ctx, mask: 1 }),
        this.service.content.info.getDetailById(params.id),
      ]);

      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4052301);
      }

      if (this.notValid(contentDetail) || !contentDetail.liveVersionId) {
        return Response.warning(i18n.page.pageContentIsOffline, 2052301);
      }

      // get the store info about the page
      const [storeDetail, childrenContentList] = await Promise.all([
        this.service.store.goods.getDetailByAppFileId(params.applicationId, contentDetail.fileId),
        this.service.content.list.find({
          'tags.extendId': contentDetail.id,
          liveVersionId: { $ne: '' },
          deleted: false,
        }),
      ]);

      if (storeDetail?.status === 1 && storeDetail?.deleted === false) {
        return Response.warning(i18n.page.pageIsOnline, 2052302);
      }

      if (childrenContentList.length > 0) {
        return Response.warning(i18n.page.pageContentHasLiveChildren, 2052303);
      }

      // sett page content live version to 0
      ctx.operations.push(
        ...this.service.log.addLogItem(LOG.CONTENT_OFFLINE, [contentDetail], {
          actionType: [LOG.UPDATE, TYPE.CONTENT].join('_'),
          category: { type: TYPE.CONTENT, contentId: params.id, fileId: contentDetail?.fileId },
        }),
      );
      await this.service.content.info.updateDetail(params.id, { liveVersionNumber: 0, liveVersionId: '' });

      return Response.success(i18n.page.setPageContentOfflineSuccess, 1052301);
    } catch (err) {
      return Response.error(err, i18n.page.setPageContentLiveFailed, 3052301);
    }
  }
}
