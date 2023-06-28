import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { File, PicType } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { ContentInfo } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentListRes, AppPageBuilderItemReq } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

interface ContentWithPic extends ContentInfo {
  pictures: PicType[];
}

interface FileContents extends File {
  contents: ContentWithPic[];
}

@JsonController('pages')
export class GetPageBuilderItemList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get application builder available items
   * @param  {AppPageBuilderItemReq} params
   * @returns {ContentInfo}
   */
  @Get('/builder-items')
  @OpenAPI({
    summary: i18n.sw.getPageBuilderItemList,
    description: '',
    tags: ['Page'],
    operationId: 'get-page-builder-item-list',
  })
  @ResponseSchema(AppContentListRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @QueryParams() params: AppPageBuilderItemReq,
  ): Promise<ResData<FileContents>> {
    try {
      let counts = 0;
      let itemFileIds: string[] = [];
      let fileList: File[] = [];
      const pageSize = this.service.file.info.setPageSize(params);
      const availableTypes = [TYPE.PAGE, TYPE.TEMPLATE, TYPE.BLOCK];

      // Get page or template items
      if (params.scope === TYPE.APPLICATION && availableTypes.indexOf(params.type) !== -1) {
        const appDetail = await this.service.application.getDetailById(params.applicationId);
        const settingItems = _.orderBy(
          _.filter(appDetail.setting?.[params.type] || [], (item) => {
            if (item.status && params.search) {
              return item.id === params.search || item.name.indexOf(params.search) !== -1;
            }
            return item.status;
          }),
          ['createTime', 'desc'],
        );
        itemFileIds = _.map(_.chunk(settingItems, pageSize.size)[pageSize.page - 1] || [], 'id');
        counts = settingItems.length || 0;
        fileList = await this.service.file.list.getDetailByIds(itemFileIds);
      } else if (params.scope === TYPE.USER && availableTypes.indexOf(params.type) !== -1) {
        // Get current user template files
        const filter: Record<string, any> = {
          applicationId: params.applicationId,
          type: params.type,
          deleted: false,
          creator: ctx.userInfo.id,
        };

        if (params.search) {
          filter['$or'] = [{ name: { $regex: new RegExp(params.search, 'i') } }, { id: params.search }];
        }

        [counts, fileList] = await Promise.all([
          this.service.file.list.getCount(filter),
          this.service.file.list.find(filter, '', {
            sort: { _id: -1 },
            skip: (pageSize.page - 1) * pageSize.size,
            limit: pageSize.size,
          }),
        ]);
      } else if (params.scope === TYPE.INVOLVE && availableTypes.indexOf(params.type) !== -1) {
        const involveFileObject = await this.service.file.list.getUserInvolveFiles({
          applicationId: params.applicationId,
          type: params.type,
          userId: ctx.userInfo.id,
          search: _.trim(params.search || '', ' '),
          skip: (pageSize.page - 1) * pageSize.size,
          limit: pageSize.size,
        });
        counts = involveFileObject.counts || 0;
        fileList = involveFileObject.list || [];
      }

      const fileContentObject = await this.service.content.list.getFileContentList(
        _.concat(itemFileIds, _.map(fileList, 'id')),
        { fileList },
      );

      const liveVersionIds = _.map(
        _.filter(_.flatten(_.toArray(fileContentObject)), (content) => content.liveVersionId),
        'liveVersionId',
      );

      const contentVersion = await this.service.version.list.getVersionListChunk(liveVersionIds);
      const contentVersionObject = _.keyBy(contentVersion, 'contentId');

      // get content pictures
      let fileContentWithPics: Record<string, ContentWithPic[]> = {};
      let fileContentList: FileContents[] = [];
      fileList.forEach((file) => {
        !fileContentWithPics[file.id] && (fileContentWithPics[file.id] = []);
        (fileContentObject[file.id] || []).forEach((content) => {
          if (content.liveVersionNumber > 0) {
            fileContentWithPics[file.id].push(
              Object.assign({}, content, { pictures: contentVersionObject[content.id]?.pictures || [] }),
            );
          }
        });

        fileContentList.push(
          Object.assign({}, file, {
            contents: fileContentWithPics[file.id],
          }) as FileContents,
        );
      });

      return Response.success(
        {
          pageInfo: this.paging(counts, pageSize),
          data: fileContentList,
        },
        1052201,
      );
    } catch (err) {
      return Response.error(err, i18n.page.getPageBuilderItemFailed, 3052201);
    }
  }
}
