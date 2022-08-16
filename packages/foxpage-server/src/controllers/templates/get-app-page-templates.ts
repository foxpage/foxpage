import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { PageContentData } from '../../types/content-types';
import { AppTypeFileParams, FileAssoc } from '../../types/file-types';
import { ResData } from '../../types/index-types';
import { AppContentListRes, AppTypeFilesReq } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

// migration to files/get-page-type-items.ts
@JsonController('templates')
export class GetAppTemplateFileList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get a list of pagination template files under the application,
   * in reverse chronological order, each file only returns one template page information.
   * Only when the file type is a variable, condition or function,
   * the largest version of the template is returned.
   * @param  {AppTypeFilesReq} params
   * @returns {PageContentData[]}
   */
  @Get('/file-searchs-migration')
  @OpenAPI({
    summary: i18n.sw.getAppTypeFileList,
    description: '',
    tags: ['Template'],
    operationId: 'get-app-template-file-list',
  })
  @ResponseSchema(AppContentListRes)
  async index(@QueryParams() params: AppTypeFilesReq): Promise<ResData<PageContentData[]>> {
    try {
      const typePageParams: AppTypeFileParams = Object.assign(
        { type: TYPE.TEMPLATE, deleted: false },
        params,
      );
      const pageInfo = this.service.file.list.setPageSize(params);
      const result = await this.service.file.list.getAppTypeFilePageList(typePageParams, pageInfo);

      let fileList = result.list as FileAssoc[];
      if (result?.list.length > 0) {
        fileList = await this.service.file.list.getFileAssocInfo(result.list);
      }

      return Response.success(
        {
          pageInfo: {
            total: result.count,
            page: pageInfo.page,
            size: pageInfo.size,
          },
          data: fileList,
        },
        1070301,
      );
    } catch (err) {
      return Response.error(err, i18n.template.getAppTemplateFileFailed, 3070301);
    }
  }
}
