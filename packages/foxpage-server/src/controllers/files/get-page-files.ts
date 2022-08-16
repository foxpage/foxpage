import 'reflect-metadata';

import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { FilePageSearch, FileUserInfo } from '../../types/file-types';
import { PageData, ResData } from '../../types/index-types';
import { FileDetailRes, FileListReq } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('file')
export class GetFileList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get file list
   * @param  {FileListReq} params
   * @returns {FileUserInfo}
   */
  @Get('s')
  @OpenAPI({
    summary: i18n.sw.fileList,
    description: '',
    tags: ['File'],
    operationId: 'file-list',
  })
  @ResponseSchema(FileDetailRes)
  async index(@QueryParams() params: FileListReq): Promise<ResData<PageData<FileUserInfo>>> {
    this.service.file.info.setPageSize(params);

    const from: number = (params.page - 1) * params.size;
    const to: number = from + params.size;

    try {
      const searchParams: FilePageSearch = {
        search: params.search || '',
        applicationId: params.applicationId,
        folderId: params.id || '',
        type: params.type as AppFolderTypes,
        from: from,
        to: to,
      };

      const fileData = await this.service.file.list.getPageData(searchParams);

      // Response
      const data = {
        pageInfo: {
          page: params.page,
          size: params.size,
          total: fileData.count,
        },
        data: fileData.list,
      };

      return Response.success(data, 1170401);
    } catch (err) {
      return Response.error(err, i18n.file.listError, 3170401);
    }
  }
}
