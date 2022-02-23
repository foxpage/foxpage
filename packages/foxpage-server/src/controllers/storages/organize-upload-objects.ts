import 'reflect-metadata';

import _ from 'lodash';
import { Body, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { ResData } from '../../types/index-types';
import { FileListRes } from '../../types/validates/file-validate-types';
import { UploadObjectsReq } from '../../types/validates/storage-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('storages')
export class UploadObjectToStorage extends BaseController {
  constructor() {
    super();
  }

  /**
   * Organize the specified resource objects and upload them to the specified bucket
   * @param  {StorageListReq} params
   * @returns {FileFolderInfo}
   */
  @Post('/organize-uploads')
  @OpenAPI({
    summary: i18n.sw.organizeUploadObjectToStorage,
    description: '',
    tags: ['Storage'],
    operationId: 'organize-upload-objects',
  })
  @ResponseSchema(FileListRes)
  async index(@Body() params: UploadObjectsReq): Promise<ResData<string>> {
    try {
      const uploadResult = await this.service.storage.organizeUpload(params);

      if (uploadResult.code === 0) {
        return Response.success(i18n.storage.organizeUploadSuccess, 1150301);
      } else {
        return Response.warning(i18n.storage.organizeUploadFailed + ':' + uploadResult.data, 2150301);
      }
    } catch (err) {
      return Response.error(err, i18n.storage.uploadObjectsFailed, 3150301);
    }
  }
}
