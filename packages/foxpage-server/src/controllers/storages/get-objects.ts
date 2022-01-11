import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { StorageListRes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { ResData } from '../../types/index-types';
import { FileListRes } from '../../types/validates/file-validate-types';
import { StorageListReq } from '../../types/validates/storage-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('storages')
export class GetStorageList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the details of the specified object list
   * @param  {StorageListReq} params
   * @returns {FileFolderInfo}
   */
  @Get('')
  @OpenAPI({
    summary: i18n.sw.getStorages,
    description: '',
    tags: ['Storage'],
    operationId: 'get-storages-List',
  })
  @ResponseSchema(FileListRes)
  async index(@QueryParams() params: StorageListReq): Promise<ResData<StorageListRes[]>> {
    try {
      const list = await this.service.storage.getList(params.prefix, {
        bucket: params.bucket || '',
        maxKeys: params.size || 10,
      });
      return Response.success(list);
    } catch (err) {
      return Response.error(err, i18n.storage.getStorageListFailed);
    }
  }
}
