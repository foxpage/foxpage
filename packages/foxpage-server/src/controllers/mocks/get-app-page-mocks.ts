import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { ContentInfo } from '../../types/content-types';
import { AppTypeFileParams, FileAssoc } from '../../types/file-types';
import { ResData } from '../../types/index-types';
import { AppContentListRes, AppTypeFilesReq } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

// migration to files/get-page-type-items.ts
@JsonController('mocks')
export class GetPageMockList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the pagination list of all mocks under the specified application, each mock folder has only one content
   * @param  {AppPageListCommonReq} params
   * @returns {ContentInfo}
   */
  @Get('/file-searchs-migrations')
  @OpenAPI({
    summary: i18n.sw.getAppScopeMocks,
    description: '',
    tags: ['Mock'],
    operationId: 'get-app-mock-page-list',
  })
  @ResponseSchema(AppContentListRes)
  async index (@QueryParams() params: AppTypeFilesReq): Promise<ResData<ContentInfo[]>> {
    try {
      const typePageParams: AppTypeFileParams = Object.assign(
        { type: TYPE.MOCK, deleted: false },
        params,
      );
      const pageInfo = this.service.file.list.setPageSize(params);
      const result = await this.service.file.list.getAppTypeFilePageList(typePageParams, pageInfo);

      let fileList = result.list as FileAssoc[];
      if (result.list.length > 0) {
        fileList = await this.service.file.list.getFileAssocInfo(result.list, { type: TYPE.MOCK });
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
        1190201,
      );
    } catch (err) {
      return Response.error(err, i18n.mock.getAppPageMockFailed, 3190201);
    }
  }
}
