import 'reflect-metadata';

import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import metric from '../../third-parties/metric';
import { ContentInfo } from '../../types/content-types';
import { ResData } from '../../types/index-types';
import { ContentDetailRes, ContentListReq } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('contents')
export class GetContentList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get a list of contents under the specified file
   * @param  {ContentListReq} params
   * @returns {ContentInfo}
   */
  @Get('')
  @OpenAPI({
    summary: i18n.sw.contentList,
    description: '',
    tags: ['Content'],
    operationId: 'content-list',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@QueryParams() params: ContentListReq): Promise<ResData<ContentInfo[]>> {
    try {
      // Check the validity of fileId
      const fileDetail = await this.service.file.info.getDetailById(params.fileId);
      if (this.notValid(fileDetail)) {
        return Response.warning(i18n.file.invalidFileId, 2160301);
      }

      const contentList = await this.service.content.file.getFileContentList(params);

      // send metric
      contentList.length === 0 && metric.empty('contents', params.applicationId);

      return Response.success(contentList, 1160301);
    } catch (err) {
      return Response.error(err, i18n.content.getContentListFailed, 3160301);
    }
  }
}
