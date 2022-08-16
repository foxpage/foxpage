import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes, FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FileContentAndVersion } from '../../types/content-types';
import { ResData } from '../../types/index-types';
import { AppContentListRes, AppTypePageListCommonReq } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('function-searchs')
export class GetPageFunctionList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the function list information of the page under the file
   * @param  {AppPageListCommonReq} params
   * @returns {FileContentAndVersion}
   */
  @Get('')
  @OpenAPI({
    summary: i18n.sw.getAppPageFunctions,
    description: '',
    tags: ['Function'],
    operationId: 'get-page-function-list',
  })
  @ResponseSchema(AppContentListRes)
  async index (@QueryParams() params: AppTypePageListCommonReq): Promise<ResData<FileContentAndVersion[]>> {
    try {
      if (params.folderId) {
        const folderDetail = await this.service.folder.info.getDetailById(params.folderId);
        if (!folderDetail || folderDetail.deleted || folderDetail.applicationId !== params.applicationId) {
          return Response.warning(i18n.folder.invalidFolderId);
        }
      } else {
        params.folderId = await this.service.folder.info.getAppTypeFolderId({
          applicationId: params.applicationId,
          type: TYPE.FUNCTION as AppFolderTypes,
        });
      }

      const fileInfo = await this.service.file.list.getItemFileContentDetail(params, <FileTypes>TYPE.FUNCTION);

      return Response.success(
        {
          pageInfo: {
            total: fileInfo.counts,
            page: params.page,
            size: params.size,
          },
          data: fileInfo.list,
        },
        1090601,
      );
    } catch (err) {
      return Response.error(err, i18n.function.getPageFunctionFailed, 3090601);
    }
  }
}
