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
@JsonController('conditions')
export class GetAppPageConditionList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get a list of all conditional pages under the specified application,
   * each conditional folder has only one content
   * @param  {AppPageListCommonReq} params
   * @returns {ContentInfo}
   */
  @Get('/file-searchs-migrations')
  @OpenAPI({
    summary: i18n.sw.getAppScopeConditions,
    description: '',
    tags: ['Condition'],
    operationId: 'get-app-condition-page-list',
  })
  @ResponseSchema(AppContentListRes)
  async index(@QueryParams() params: AppTypeFilesReq): Promise<ResData<ContentInfo[]>> {
    try {
      const typePageParams: AppTypeFileParams = Object.assign(
        { type: TYPE.CONDITION, deleted: false },
        params,
      );
      const pageInfo = this.service.file.list.setPageSize(params);
      const result = await this.service.file.list.getAppTypeFilePageList(typePageParams, pageInfo);

      // Get the folder name of the file and the content information of the file
      let fileList = result.list as FileAssoc[];
      let contentObject: Record<string, Content> = {};
      const fileIds = _.map(fileList, 'id') as string[];
      [fileList, contentObject] = await Promise.all([
        this.service.file.list.getFileAssocInfo(result?.list || [], { type: TYPE.CONDITION }),
        this.service.content.list.getContentObjectByFileIds(fileIds)
      ]);

      fileList.forEach(condition => {
        if(!condition.version) {
          condition.version = {};
        }

        if (contentObject[condition.id]) {
          condition.version.live = this.service.version.number.getVersionFromNumber(contentObject[condition.id].liveVersionNumber);
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
        1100201,
      );
    } catch (err) {
      return Response.error(err, i18n.condition.getAppPageConditionsFailed, 3100201);
    }
  }
}
