import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { tag } from '@foxpage/foxpage-shared';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { ContentInfoUrl, ContentSearch } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { ContentDetailRes, ContentListReq } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController()
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
  @Get('pages/content-searchs')
  @Get('templates/content-searchs')
  @Get('blocks/content-searchs')
  @OpenAPI({
    summary: i18n.sw.getPageContentList,
    description: '',
    tags: ['Page'],
    operationId: 'get-page-content-list',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @QueryParams() params: ContentListReq): Promise<ResData<ContentInfoUrl>> {
    try {
      const apiType = this.getRoutePath(ctx.request.url);

      // Check file deleted status
      const fileDetail = await this.service.file.info.getDetailById(params.fileId);
      if (this.notValid(fileDetail) || (!params.deleted && fileDetail.deleted)) {
        return Response.warning(i18n.page.fileIsInvalidOrDeleted, 2050701);
      }

      const contentParams: ContentSearch = {
        fileId: params.fileId,
        deleted: params.deleted || false,
        search: '',
        page: 1,
        size: 1000,
      };
      const [contentList, appDetail] = await Promise.all([
        this.service.content.file.getFileContentList(contentParams),
        this.service.application.getDetailById(params.applicationId),
      ]);

      const changedContentIds = await this.service.contentLog.getChangedContent(_.map(contentList, 'id'));

      let hostLocaleObject: Record<string, string[]> = {};
      if (apiType === TYPE.PAGE) {
        // Splicing content url
        let pathNames: string[] = [];
        const slug = appDetail.slug || '';
        if (fileDetail && fileDetail?.tags) {
          pathNames = _.pullAll(_.map(fileDetail.tags, 'pathname'), ['', undefined, null]);
        }

        if (pathNames.length > 0) {
          hostLocaleObject = this.service.application.getAppHostLocaleUrl(
            appDetail?.host || [],
            pathNames,
            slug,
          );
        }
      }

      let urls: string[] = [];
      let contentListWithUrls: ContentInfoUrl[] = [];
      contentList.forEach((content) => {
        if (apiType === TYPE.PAGE) {
          urls = [];
          if (!_.isEmpty(hostLocaleObject)) {
            content.tags.forEach((item) => {
              const query = _.pull(tag.generateQueryStringByTags([item]), '');
              if (item.locale) {
                if (hostLocaleObject[item.locale]) {
                  urls.push(...hostLocaleObject[item.locale].map((hostName) => hostName + '?' + query));
                } else if (hostLocaleObject['base']) {
                  urls.push(...hostLocaleObject['base'].map((hostname) => hostname + '?' + query));
                }
              }
            });
            if (urls.length === 0 && hostLocaleObject['base']) {
              urls.push(...hostLocaleObject['base']);
            }
          }
          _.pullAll(urls, [null, undefined, '']);
        }

        content.changed = changedContentIds.indexOf(content.id) !== -1;
        content.isBase = _.remove(content.tags, (tag) => !_.isNil(tag.isBase))[0]?.isBase || false;
        content.extendId = _.remove(content.tags, (tag) => !_.isNil(tag.extendId))[0]?.extendId || '';
        if (apiType === TYPE.PAGE) {
          contentListWithUrls.push(Object.assign({}, content, { urls: _.clone(urls) }));
        } else {
          contentListWithUrls.push(content);
        }
      });

      return Response.success(contentListWithUrls, 1050701);
    } catch (err) {
      return Response.error(err, i18n.page.getPageContentListFailed, 3050701);
    }
  }
}
