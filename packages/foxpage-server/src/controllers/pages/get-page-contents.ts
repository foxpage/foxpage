import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { tag } from '@foxpage/foxpage-shared';

import { i18n } from '../../../app.config';
import { ContentInfoUrl, ContentSearch } from '../../types/content-types';
import { ResData } from '../../types/index-types';
import { ContentDetailRes, ContentListReq } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { mergeUrl } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('pages')
export class GetPageContentList extends BaseController {
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
    summary: i18n.sw.getPageContentList,
    description: '',
    tags: ['Page'],
    operationId: 'get-page-content-list',
  })
  @ResponseSchema(ContentDetailRes)
  async index (@QueryParams() params: ContentListReq): Promise<ResData<ContentInfoUrl>> {
    try {
      const contentParams: ContentSearch = {
        fileId: params.fileId,
        search: '',
        page: 1,
        size: 1000,
      };
      const [contentList, fileDetail, appDetail] = await Promise.all([
        this.service.content.file.getFileContentList(contentParams),
        this.service.file.info.getDetailById(params.fileId),
        this.service.application.getDetailById(params.applicationId),
      ]);

      // Splicing content url
      let pathname = '';
      const slug = appDetail.slug || '';
      if (fileDetail && fileDetail?.tags) {
        const pathIndex = fileDetail.tags.findIndex((tag) => tag.pathname);
        if (pathIndex !== -1) {
          pathname = fileDetail.tags[pathIndex].pathname || '';
        }
      }

      let urls: string[] = [];
      let contentListWithUrls: ContentInfoUrl[] = [];
      let hostPath = '';
      if (pathname) {
        hostPath = mergeUrl(appDetail?.host?.[0] || '', pathname, slug);
      }

      contentList.forEach((content) => {
        urls = [];
        if (hostPath) {
          const queryList = _.pull(tag.generateQueryStringByTags(content.tags || []), '');
          queryList.forEach((query) => {
            urls.push(hostPath + '?' + query);
          });

          if (urls.length === 0) {
            urls = [hostPath];
          }
        }

        content.isBase = _.remove(content.tags, (tag) => !_.isNil(tag.isBase))[0]?.isBase || false;
        content.extendId = _.remove(content.tags, (tag) => !_.isNil(tag.extendId))[0]?.extendId || '';
        contentListWithUrls.push(Object.assign({}, content, { urls: _.clone(urls) }));
      });

      return Response.success(contentListWithUrls, 1050701);
    } catch (err) {
      return Response.error(err, i18n.page.getPageContentListFailed, 3050701);
    }
  }
}
