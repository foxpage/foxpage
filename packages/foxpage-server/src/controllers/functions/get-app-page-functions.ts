import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { ContentInfo } from '../../types/content-types';
import { AppTypeFileParams, FileAssoc } from '../../types/file-types';
import { ResData } from '../../types/index-types';
import { AppContentListRes, AppTypeFilesReq } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

// migration to files/get-page-type-items.ts
@JsonController('functions')
export class GetAppPageFunctionList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the pagination list of all functions under the specified application,
   * each function folder has only one content
   * @param  {AppPageListCommonReq} params
   * @returns {ContentInfo}
   */
  @Get('/file-searchs-migrations')
  @OpenAPI({
    summary: i18n.sw.getAppScopeFunctions,
    description: '',
    tags: ['Function'],
    operationId: 'get-app-function-page-list',
  })
  @ResponseSchema(AppContentListRes)
  async index(@QueryParams() params: AppTypeFilesReq): Promise<ResData<ContentInfo[]>> {
    try {
      const typePageParams: AppTypeFileParams = Object.assign(
        { type: TYPE.FUNCTION, deleted: false },
        params,
      );
      const pageInfo = this.service.file.list.setPageSize(params);
      const result = await this.service.file.list.getAppTypeFilePageList(typePageParams, pageInfo);

      let fileList = result.list as FileAssoc[];
      let contentObject: Record<string, Content> = {};
      const fileIds = _.map(fileList, 'id') as string[];
      [fileList, contentObject] = await Promise.all([
        this.service.file.list.getFileAssocInfo(result.list, { type: TYPE.FUNCTION }),
        this.service.content.list.getContentObjectByFileIds(fileIds)
      ]);

      fileList.forEach(fun => {
        if(!fun.version) {
          fun.version = {};
        }

        if (contentObject[fun.id]) {
          fun.version.live = this.service.version.number.getVersionFromNumber(contentObject[fun.id].liveVersionNumber);
        }
      });      

      return Response.success(
        {
          pageInfo: {
            total: result.count,
            page: pageInfo.page,
            size: pageInfo.size,
          },
          data: fileList,
        },
        1090201,
      );
    } catch (err) {
      return Response.error(err, i18n.function.getAppPageFunctionFailed, 3090201);
    }
  }
}
