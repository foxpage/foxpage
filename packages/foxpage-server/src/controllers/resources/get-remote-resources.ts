import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { NewResourceDetail } from '../../types/file-types';
import { ResData } from '../../types/index-types';
import { FileListRes } from '../../types/validates/file-validate-types';
import { ResourceGroupReq } from '../../types/validates/resource-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('resources')
export class GetRemoteResourceList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get remote resource server info list
   * 1, get resource group detail
   * 2, get resource list by plugin
   * 3, check if the resources exist
   * @param  {FileListReq} params
   * @returns {FileFolderInfo}
   */
  @Get('/remote')
  @OpenAPI({
    summary: i18n.sw.getRemoteResources,
    description: '',
    tags: ['Resource'],
    operationId: 'get-remote-resource-list',
  })
  @ResponseSchema(FileListRes)
  async index(@QueryParams() params: ResourceGroupReq): Promise<ResData<NewResourceDetail[]>> {
    try {
      const options = { name: params.name || '' };
      const resourceList: NewResourceDetail[] = await this.service.resource.getResourceGroupLatestVersion(
        params.id,
        options,
      );

      return Response.success(resourceList, 1120901);
    } catch (err) {
      return Response.error(err, '', 3120901);
    }
  }
}
