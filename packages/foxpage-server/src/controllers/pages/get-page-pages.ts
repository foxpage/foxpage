import 'reflect-metadata';

import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { ContentInfo } from '../../types/content-types';
import { ResData } from '../../types/index-types';
import { AppContentListRes, AppPageListCommonReq } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('page-searchs')
export class GetPageList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the list of pages under the file
   * @param  {AppPageListCommonReq} params
   * @returns {ContentInfo}
   */
  @Get('')
  @OpenAPI({
    summary: i18n.sw.getAppPagePages,
    description: '',
    tags: ['Page'],
    operationId: 'get-page-list',
  })
  @ResponseSchema(AppContentListRes)
  async index(@QueryParams() params: AppPageListCommonReq): Promise<ResData<ContentInfo[]>> {
    try {
      const fileDetail = await this.service.file.info.getDetailById(params.fileId);
      if (
        this.notValid(fileDetail) ||
        fileDetail.applicationId !== params.applicationId ||
        fileDetail.type !== TYPE.PAGE
      ) {
        return Response.warning(i18n.file.invalidFileId, 2050801);
      }

      params.page = !params.page || params.page < 1 ? 1 : params.page;
      params.size = !params.size || params.size < 1 ? 10 : params.size;
      const result = await this.service.content.file.getFilePageContent(
        Object.assign({}, params, { type: TYPE.PAGE as FileTypes }),
      );

      return Response.success(
        {
          pageInfo: {
            total: result.count,
            page: params.page,
            size: params.size,
          },
          data: result.list,
        },
        1050801,
      );
    } catch (err) {
      return Response.error(err, i18n.page.getPagePagesFailed, 3050801);
    }
  }
}
