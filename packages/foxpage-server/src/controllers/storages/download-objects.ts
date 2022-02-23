import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { FileListRes } from '../../types/validates/file-validate-types';
import { DownloadObjectsReq } from '../../types/validates/storage-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('storages')
export class DownloadStorageObjects extends BaseController {
  constructor() {
    super();
  }

  /**
   * Load a list of objects with the specified prefix
   * @param  {StorageListReq} params
   * @returns {FileFolderInfo}
   */
  @Get('/download')
  @OpenAPI({
    summary: i18n.sw.downloadStorageObjects,
    description: '',
    tags: ['Storage'],
    operationId: 'download-objects',
  })
  @ResponseSchema(FileListRes)
  async index(@Ctx() ctx: any, @QueryParams() params: DownloadObjectsReq): Promise<any> {
    try {
      const downloadInfo = await this.service.storage.downloads(params.prefix);

      if (downloadInfo.code === 0) {
        // TODO Consider uploading the file to an object storage service, and then provide a download connection
        ctx.set('Content-disposition', 'attachment; filename=' + downloadInfo.fileName);
        ctx.set('Content-type', 'application/zip');
        return Response.download(downloadInfo.contentBuffer);
      } else {
        return Response.warning(JSON.stringify(downloadInfo), 2150101);
      }
    } catch (err) {
      return Response.error(err, i18n.storage.downloadObjectsFailed, 3150101);
    }
  }
}
