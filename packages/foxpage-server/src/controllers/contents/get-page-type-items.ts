import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes, FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { FileContentAndVersion } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentListRes, AppTypePageListCommonReq } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('')
export class GetPageTypeItemList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get conditional pagination list
   * @param  {AppPageListCommonReq} params
   * @returns {FileContentAndVersion}
   */
  @Get('variable-searchs')
  @Get('condition-searchs')
  @Get('function-searchs')
  @OpenAPI({
    summary: i18n.sw.getAppPageConditions,
    description: '',
    tags: ['Content'],
    operationId: 'get-condition-list',
  })
  @ResponseSchema(AppContentListRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @QueryParams() params: AppTypePageListCommonReq,
  ): Promise<ResData<FileContentAndVersion[]>> {
    try {
      const apiType = this.getRoutePath(ctx.request.url);
      this.service.folder.info.setPageSize(params);

      if (params.folderId) {
        const folderDetail = await this.service.folder.info.getDetailById(params.folderId);
        if (this.notValid(folderDetail) || folderDetail.applicationId !== params.applicationId) {
          return Response.warning(i18n.folder.invalidFolderId, 2161701);
        }
      } else {
        params.folderId = await this.service.folder.info.getAppTypeFolderId({
          applicationId: params.applicationId,
          type: apiType as AppFolderTypes,
        });
      }

      const fileInfo = await this.service.file.list.getItemFileContentDetail(params, apiType as FileTypes);

      return Response.success(
        {
          pageInfo: {
            total: fileInfo.counts,
            page: params.page,
            size: params.size,
          },
          data: fileInfo.list,
        },
        1161701,
      );
    } catch (err) {
      return Response.error(err, i18n.content.getPageTypeItemsFailed, 3161701);
    }
  }
}
