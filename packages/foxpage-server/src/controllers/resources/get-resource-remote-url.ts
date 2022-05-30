import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { TAG } from '../../../config/constant';
import { ResData } from '../../types/index-types';
import { FileListRes } from '../../types/validates/file-validate-types';
import { ResourceRemoteURLReq } from '../../types/validates/resource-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('resources')
export class GetResourceRemoteURL extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get resource group remote url
   * @param  {FileListReq} params
   * @returns {FileFolderInfo}
   */
  @Get('/remote-url')
  @OpenAPI({
    summary: i18n.sw.getResourceRemoteURL,
    description: '',
    tags: ['Resource'],
    operationId: 'get-resource-remote-url',
  })
  @ResponseSchema(FileListRes)
  async index (@QueryParams() params: ResourceRemoteURLReq): Promise<ResData<string>> {
    try {
      const [resourceGroupDetail, appDetail] = await Promise.all([
        this.service.folder.info.getDetailById(params.id),
        this.service.application.getDetailById(params.applicationId)
      ]);

      let resourceTypeTag: Record<string, string> = {};
      let resourceConfigTag: Record<string, string> = {};
      if (resourceGroupDetail.tags) {
        resourceTypeTag = _.find(resourceGroupDetail.tags, { type: TAG.RESOURCE_GROUP });
        resourceConfigTag = _.find(resourceGroupDetail.tags, { type: TAG.RESOURCE_CONFIG });
      }

      if (!resourceGroupDetail ||
        resourceGroupDetail.applicationId !== params.applicationId ||
        _.isEmpty(resourceTypeTag)
      ) {
        return Response.warning('Invalid resource group id', 2120601);
      }

      if (params.resourceScope) {
        resourceConfigTag.resourceScope = params.resourceScope;
      }

      const appResourceDetail = _.filter(appDetail.resources || [], { id: resourceTypeTag.resourceId })?.[0] || {};
      const groupType = (appResourceDetail.name || '').toLowerCase();
      const remoteUrl = await this.service.resource.getResourceRemoteUrl(
        groupType,
        resourceConfigTag
      );

      return Response.success(remoteUrl, 1120601);
    } catch (err) {
      return Response.error(err, i18n.resource.getResourceGroupDetailFailed, 3120601);
    }
  }
}
