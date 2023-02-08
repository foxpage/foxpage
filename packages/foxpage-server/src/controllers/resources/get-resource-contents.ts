import 'reflect-metadata';

import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { ContentInfo } from '../../types/content-types';
import { ResData } from '../../types/index-types';
import { ContentDetailRes } from '../../types/validates/content-validate-types';
import { ResourceContentListReq } from '../../types/validates/resource-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('resources')
export class GetResourceContentList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the list of pages under the file
   * @param  {ResourceContentListReq} params
   * @returns {ContentInfo}
   */
  @Get('/contents')
  @OpenAPI({
    summary: i18n.sw.getResourceContentList,
    description: '',
    tags: ['Resource'],
    operationId: 'get-resource-content-list',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@QueryParams() params: ResourceContentListReq): Promise<ResData<ContentInfo[]>> {
    try {
      // Check the validity of fileId
      const fileDetail = await this.service.file.info.getDetailById(params.id);

      if (this.notValid(fileDetail)) {
        return Response.warning(i18n.file.invalidFileId, 2121201);
      }

      const contentList = await this.service.content.file.getFileContentList({
        fileId: params.id,
        size: 1000,
      });
      return Response.success(contentList, 1121201);
    } catch (err) {
      return Response.error(err, i18n.content.getContentListFailed, 3121201);
    }
  }
}
