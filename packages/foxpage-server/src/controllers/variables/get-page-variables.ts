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

@JsonController('variable-searchs')
export class GetPageVariableList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the information of the paging variable list under the file
   * if folderId is valid and type = all, return variables in special project and app
   * @param  {AppPageListCommonReq} params
   * @returns {ContentInfo}
   */
  @Get('')
  @OpenAPI({
    summary: i18n.sw.getAppPageVariables,
    description: '',
    tags: ['Variable'],
    operationId: 'get-page-variable-list',
  })
  @ResponseSchema(AppContentListRes)
  async index (@QueryParams() params: AppTypePageListCommonReq): Promise<ResData<FileContentAndVersion[]>> {
    try {
      this.service.folder.info.setPageSize(params);

      if (params.folderId) {
        const folderDetail = await this.service.folder.info.getDetailById(params.folderId);
        if (!folderDetail || folderDetail.deleted || folderDetail.applicationId !== params.applicationId) {
          return Response.warning(i18n.folder.invalidFolderId, 2080301);
        }
      } else {
        const appFolderId = await this.service.folder.info.getAppTypeFolderId({
          applicationId: params.applicationId,
          type: TYPE.VARIABLE as AppFolderTypes,
        });
        params.folderId = appFolderId;
      }

      const fileInfo = await this.service.file.list.getItemFileContentDetail(params, <FileTypes>TYPE.VARIABLE);

      return Response.success(
        {
          pageInfo: {
            total: fileInfo.counts,
            page: params.page,
            size: params.size,
          },
          data: fileInfo.list,
        },
        1080301,
      );
    } catch (err) {
      return Response.error(err, i18n.variable.getPageVariableFailed, 3080301);
    }
  }
}
