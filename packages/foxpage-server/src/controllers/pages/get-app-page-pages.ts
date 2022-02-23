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

@JsonController('pages')
export class GetAppPageFileList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get a list of paging files under the app, in reverse chronological order
   * @param  {AppTypeFilesReq} params
   * @returns {PageContentData[]}
   */
  @Get('/file-searchs')
  @OpenAPI({
    summary: i18n.sw.getAppTypeFileList,
    description: '',
    tags: ['Page'],
    operationId: 'get-app-page-file-list',
  })
  @ResponseSchema(AppContentListRes)
  async index(@QueryParams() params: AppTypeFilesReq): Promise<ResData<PageContentData[]>> {
    try {
      const typePageParams: AppTypeFileParams = Object.assign({ type: TYPE.PAGE, deleted: false }, params);
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
        1050301,
      );
    } catch (err) {
      return Response.error(err, i18n.page.getAppPageFileFailed, 3050301);
    }
  }
}
