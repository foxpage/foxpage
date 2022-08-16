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

      let hostLocaleObject: Record<string, string> = {};
      if (pathname) {
        hostLocaleObject = this.service.application.getAppHostLocaleUrl(appDetail?.host || [], pathname, slug);
      }

      let urls: string[] = [];
      let contentListWithUrls: ContentInfoUrl[] = [];
      contentList.forEach((content) => {
        urls = [];
        if (!_.isEmpty(hostLocaleObject)) {
          content.tags.forEach(item => {
            const query = _.pull(tag.generateQueryStringByTags([item]), '');
            if (item.locale) {
              if (hostLocaleObject[item.locale]) {
                urls.push(hostLocaleObject[item.locale] + '?' + query);
              } else {
                urls.push(hostLocaleObject['base'] + '?' + query);
              }
            }
          });
          if (urls.length === 0) {
            urls.push(hostLocaleObject['base']);
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
