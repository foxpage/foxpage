import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { ContentInfo, ContentSearch } from '../../types/content-types';
import { ResData } from '../../types/index-types';
import { ContentDetailRes, ContentListReq } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('templates')
export class GetTemplateContentList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the content list details of the specified page
   * @param  {FileDetailReq} params
   * @param  {Header} headers
   * @returns {File}
   */
  @Get('/content-searchs')
  @OpenAPI({
    summary: i18n.sw.getTemplateContentList,
    description: '',
    tags: ['Template'],
    operationId: 'get-template-content-list',
  })
  @ResponseSchema(ContentDetailRes)
  async index (@QueryParams() params: ContentListReq): Promise<ResData<ContentInfo[]>> {
    try {
      // Check file deleted status
      const fileDetail = await this.service.file.info.getDetailById(params.fileId);
      if (!fileDetail || (!params.deleted && fileDetail.deleted)) {
        return Response.warning(i18n.page.fileIsInvalidOrDeleted, 2070801);
      }

      const contentParams: ContentSearch = {
        fileId: params.fileId,
        deleted: params.deleted || false,
        search: params.search || '',
        page: 1,
        size: 1000,
      };
      const contentList = await this.service.content.file.getFileContentList(contentParams);

      contentList.forEach((content) => {
        content.isBase = _.remove(content.tags, (tag) => !_.isNil(tag.isBase))[0]?.isBase || false;
        content.extendId = _.remove(content.tags, (tag) => !_.isNil(tag.extendId))[0]?.extendId || '';
      });

      return Response.success(contentList, 1070801);
    } catch (err) {
      return Response.error(err, i18n.template.getTemplateContentListFailed, 3070801);
    }
  }
}
