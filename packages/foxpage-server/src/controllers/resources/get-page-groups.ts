import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FolderPageSearch, FolderUserInfo } from '../../types/file-types';
import { PageData, ResData } from '../../types/index-types';
import { FolderListRes } from '../../types/validates/file-validate-types';
import { ResourceGroupListReq } from '../../types/validates/resource-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('resources')
export class GetResourceGroupPageList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get a paging list of resources
   * @param  {FileListReq} params
   * @returns {FileFolderInfo}
   */
  @Get('/group-searchs')
  @OpenAPI({
    summary: i18n.sw.getResourceGroupList,
    description: '',
    tags: ['Resource'],
    operationId: 'get-page-resource-group-list',
  })
  @ResponseSchema(FolderListRes)
  async index(@QueryParams() params: ResourceGroupListReq): Promise<ResData<PageData<FolderUserInfo>>> {
    this.service.folder.info.setPageSize(params);

    const from: number = (params.page - 1) * params.size;
    const to: number = from + params.size;

    try {
      let searchParams: FolderPageSearch = {
        search: params.search || '',
        applicationId: params.applicationId,
        from: from,
        to: to,
      };

      const [appDetail, groupInfo] = await Promise.all([
        this.service.application.getDetailById(params.applicationId),
        this.service.folder.list.getFolderPageList(searchParams, TYPE.RESOURCE as AppFolderTypes),
      ]);

      // Get the resource type name
      const appResourceObject = _.keyBy(appDetail?.resources || [], 'id');
      groupInfo.list.forEach((group) => {
        group?.tags &&
          group.tags.forEach((tag) => {
            if (tag.resourceType && tag.resourceId) {
              tag.origin = appResourceObject[tag.resourceId]?.name || '';
            }
          });
      });

      return Response.success(
        {
          data: groupInfo.list,
          pageInfo: {
            total: groupInfo.count,
            page: params.page,
            size: params.size,
          },
        },
        1120701,
      );
    } catch (err) {
      return Response.error(err, i18n.resource.getPageResourceFailed, 3120701);
    }
  }
}
