import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { FileContents } from '../../types/file-types';
import { FoxCtx, ResData } from '../../types/index-types';
import {
  AppPageItemListContentReq,
  AppProjectItemContentDetailRes,
} from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('projects')
export class GetPageProjectItemListWithContents extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the page items with content list under application
   * if the project id is valid, response items under project
   * @param  {AppPageListCommonReq} params
   * @returns {ContentInfo}
   */
  @Get('/page-content/search')
  @Get('/template-content/search')
  @Get('/page-content/searchs')
  @Get('/template-content/searchs')
  @Get('/block-content/searchs')
  @OpenAPI({
    summary: i18n.sw.getAppProjectItemPageList,
    description: '',
    tags: ['Project'],
    operationId: 'get-page-item-content-list',
  })
  @ResponseSchema(AppProjectItemContentDetailRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @QueryParams() params: AppPageItemListContentReq,
  ): Promise<ResData<FileContents[]>> {
    try {
      const apiType = this.getRoutePath(ctx.request.url, 2);

      const searchParams: Record<string, any> = {
        applicationId: params.applicationId,
        deleted: false,
        type: apiType,
      };

      if (params.projectId) {
        searchParams.folderId = params.projectId;
      }

      if (params.search) {
        searchParams['$or'] = [{ name: { $regex: new RegExp(params.search, 'i') } }, { id: params.search }];
      }

      const pageSize = this.service.file.list.setPageSize(params);
      const [counts, fileList] = await Promise.all([
        this.service.file.list.getCount(searchParams),
        this.service.file.list.find(searchParams, '', {
          skip: (pageSize.page - 1) * pageSize.size,
          limit: pageSize.size,
        }),
      ]);

      // map reference file
      const fileIdMap = this.service.file.info.filterReferenceFile(fileList);
      const referenceFileIds = _.keys(fileIdMap);

      // get file content list
      const contentList = await this.service.content.list.find({
        fileId: { $in: _.map(fileList, 'id').concat(referenceFileIds) },
        deleted: false,
      });

      let fileContentObject: Record<string, FileContents> = {};
      fileList.forEach((file) => {
        fileContentObject[file.id] = Object.assign({}, file, { contents: [] });
      });

      contentList.forEach((content) => {
        if (fileContentObject[content.fileId]) {
          fileContentObject[content.fileId].contents.push(content);
        } else if (fileIdMap[content.fileId] && fileContentObject[fileIdMap[content.fileId]]) {
          content.fileId = fileIdMap[content.fileId];
          fileContentObject[content.fileId].contents.push(content);
        }
      });

      return Response.success(
        {
          pageInfo: this.paging(counts, pageSize),
          data: _.toArray(fileContentObject),
        },
        1200101,
      );
    } catch (err) {
      return Response.error(err, i18n.page.getPagePagesFailed, 3200101);
    }
  }
}
