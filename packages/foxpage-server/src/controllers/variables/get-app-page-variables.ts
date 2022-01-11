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

@JsonController('variables')
export class GetPageVariableList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the pagination list of all variables under the specified application, each variable folder has only one content
   * @param  {AppPageListCommonReq} params
   * @returns {ContentInfo}
   */
  @Get('/file-searchs')
  @OpenAPI({
    summary: i18n.sw.getAppScopeVariables,
    description: '',
    tags: ['Variable'],
    operationId: 'get-app-variable-page-list',
  })
  @ResponseSchema(AppContentListRes)
  async index(@QueryParams() params: AppTypeFilesReq): Promise<ResData<ContentInfo[]>> {
    try {
      const typePageParams: AppTypeFileParams = Object.assign(
        { type: TYPE.VARIABLE, deleted: false },
        params,
      );
      const pageInfo = this.service.file.list.setPageSize(params);
      const result = await this.service.file.list.getAppTypeFilePageList(typePageParams, pageInfo);

      let fileList = result.list as FileAssoc[];
      if (result.list.length > 0) {
        fileList = await this.service.file.list.getFileAssocInfo(result.list, { type: TYPE.VARIABLE });
      }

      return Response.success({
        pageInfo: {
          total: result.count,
          page: pageInfo.page,
          size: pageInfo.size,
        },
        data: fileList,
      });
    } catch (err) {
      return Response.error(err, i18n.variable.getAppPageVariableFailed);
    }
  }
}
