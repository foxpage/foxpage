import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
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
      const remoteUrl = await this.service.resource.getResourceRemoteUrl(
        params.resourceType.toLowerCase(),
        {
          resourceScope: params.resourceScope
        }
      );

      return Response.success(remoteUrl, 1120601);
    } catch (err) {
      return Response.error(err, i18n.resource.getResourceGroupDetailFailed, 3120601);
    }
  }
}
