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

@JsonController('condition-searchs')
export class GetConditionList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get conditional pagination list
   * @param  {AppPageListCommonReq} params
   * @returns {FileContentAndVersion}
   */
  @Get('')
  @OpenAPI({
    summary: i18n.sw.getAppPageConditions,
    description: '',
    tags: ['Condition'],
    operationId: 'get-condition-list',
  })
  @ResponseSchema(AppContentListRes)
  async index(@QueryParams() params: AppTypePageListCommonReq): Promise<ResData<FileContentAndVersion[]>> {
    try {
      this.service.folder.info.setPageSize(params);

      if (params.folderId) {
        const folderDetail = await this.service.folder.info.getDetailById(params.folderId);
        if (!folderDetail || folderDetail.deleted || folderDetail.applicationId !== params.applicationId) {
          return Response.warning(i18n.folder.invalidFolderId, 2100501);
        }
      } else {
        params.folderId = await this.service.folder.info.getAppTypeFolderId({
          applicationId: params.applicationId,
          type: TYPE.CONDITION as AppFolderTypes,
        });
      }

      const fileInfo = await this.service.file.list.getItemFileContentDetail(
        params,
        <FileTypes>TYPE.CONDITION,
      );

      return Response.success(
        {
          pageInfo: {
            total: fileInfo.counts,
            page: params.page,
            size: params.size,
          },
          data: fileInfo.list,
        },
        1100501,
      );
    } catch (err) {
      return Response.error(err, i18n.condition.getPageConditionFailed, 3100501);
    }
  }
}
