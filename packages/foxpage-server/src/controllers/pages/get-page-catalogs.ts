import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { File, FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { ContentInfo } from '../../types/content-types';
import { ResData } from '../../types/index-types';
import { AppContentListRes, AppPageCatalogCommonReq } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

interface fileContents extends File {
  contents: ContentInfo[];
}

@JsonController('pages')
export class GetPageCatalogList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get a list of file directory pages
   * @param  {AppPageListCommonReq} params
   * @returns {ContentInfo}
   */
  @Get('/catalogs')
  @OpenAPI({
    summary: i18n.sw.getPageCatalogs,
    description: '',
    tags: ['Page'],
    operationId: 'get-page-catalog-list',
  })
  @ResponseSchema(AppContentListRes)
  async index(@QueryParams() params: AppPageCatalogCommonReq): Promise<ResData<fileContents>> {
    try {
      const fileDetail = await this.service.file.info.getDetailById(params.id);
      if (
        !fileDetail ||
        fileDetail.deleted ||
        fileDetail.applicationId !== params.applicationId ||
        fileDetail.type !== TYPE.PAGE
      ) {
        return Response.warning(i18n.file.invalidFileId, 2050601);
      }

      const result = await this.service.content.file.getFilePageContent({
        applicationId: params.applicationId,
        fileId: params.id,
        page: 1,
        size: 500,
        type: TYPE.PAGE as FileTypes,
      });

      result.list.forEach((content) => {
        content.isBase = _.remove(content.tags, (tag) => !_.isNil(tag.isBase))[0]?.isBase || false;
        content.extendId = _.remove(content.tags, (tag) => !_.isNil(tag.extendId))[0]?.extendId || '';
      });

      return Response.success(result.list, 1050601);
    } catch (err) {
      return Response.error(err, i18n.page.getPagePagesFailed, 3050601);
    }
  }
}
