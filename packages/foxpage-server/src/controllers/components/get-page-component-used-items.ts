import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { ResData } from '../../types/index-types';
import { UserBase } from '../../types/user-types';
import { AppComponentsRes, GetComponentUsedReq } from '../../types/validates/component-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

interface ComponentUsedItem {
  applicationId: string;
  folder: {
    id: string;
    name: string;
  };
  file: {
    id: string;
    name: string;
  };
  content: {
    id: string;
    name: string;
    locales: any[];
    creator: UserBase;
    createTime: string;
    updateTime: string;
  };
}

@JsonController('components')
export class GetComponentUsedList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the component used items list
   * filter version data and response group by content
   * @param  {ComponentContentVersionReq} params
   * @returns {}
   */
  @Get('/used')
  @OpenAPI({
    summary: i18n.sw.getAppComponent,
    description: '/components',
    tags: ['Component'],
    operationId: 'get-application-component-used',
  })
  @ResponseSchema(AppComponentsRes)
  async index(@QueryParams() params: GetComponentUsedReq): Promise<ResData<ComponentUsedItem[]>> {
    try {
      const pageSize = this.service.relation.setPageSize(params);
      let aggregateList: Record<string, any>[] = [];
      if (params.live) {
        aggregateList = [
          {
            $match: {
              applicationId: params.applicationId,
              tags: { $elemMatch: { type: TYPE.COMPONENT, key: 'name', value: params.name } },
              level: TYPE.VERSION,
              deleted: false,
            },
          },
          { $unwind: '$parentItems' },
          { $match: { 'parentItems.type': TYPE.VERSION } },
          {
            $lookup: {
              from: 'fp_application_content',
              localField: 'parentItems.id',
              foreignField: 'liveVersionId',
              as: 'contentItem',
            },
          },
          {
            $group: {
              _id: '$contentItem.id',
              updateTime: { $max: '$versionItem.updateTime' },
              versionIds: { $push: '$contentItem.liveVersionId' },
            },
          },
          { $match: { _id: { $ne: [] } } },
          { $sort: { updateTime: -1 } },
          {
            $facet: {
              metadata: [{ $count: 'total' }, { $addFields: { page: pageSize.page } }],
              data: [{ $skip: (pageSize.page - 1) * pageSize.size }, { $limit: pageSize.size }],
            },
          },
        ];
      } else {
        aggregateList = [
          {
            $match: {
              applicationId: params.applicationId,
              tags: { $elemMatch: { type: TYPE.COMPONENT, key: 'name', value: params.name } },
              level: TYPE.VERSION,
              deleted: false,
            },
          },
          { $unwind: '$parentItems' },
          { $match: { 'parentItems.type': TYPE.VERSION } },
          {
            $lookup: {
              from: 'fp_application_content_version',
              localField: 'parentItems.id',
              foreignField: 'id',
              as: 'versionItem',
            },
          },
          {
            $group: {
              _id: '$versionItem.contentId',
              updateTime: { $max: '$versionItem.updateTime' },
              versionIds: { $push: '$versionItem.id' },
            },
          },
          { $sort: { updateTime: -1 } },
          {
            $facet: {
              metadata: [{ $count: 'total' }, { $addFields: { page: pageSize.page } }],
              data: [{ $skip: (pageSize.page - 1) * pageSize.size }, { $limit: pageSize.size }],
            },
          },
        ];
      }
      const usedItemList = await this.service.relation.aggregate(aggregateList);
      // get page parent level infos
      const contentIds: string[] = _.flatten(_.map(usedItemList[0]?.data, '_id'));
      const versionIds: string[] = _.flatten(_.flatten(_.map(usedItemList[0]?.data, 'versionIds')));
      const [contentParentObject, versionInfoList] = await Promise.all([
        this.service.content.list.getContentAllParents(contentIds),
        this.service.version.list.find(
          { id: { $in: versionIds }, deleted: false },
          'id version versionNumber contentId createTime updateTime',
        ),
      ]);

      let contentParentBaseObject: Record<string, any> = {};
      let userIds: string[] = [];
      for (const version of versionInfoList) {
        const contentId = version.contentId;
        if (contentParentBaseObject[contentId]) {
          continue;
        }

        contentParentBaseObject[contentId] = { applicationId: params.applicationId };
        (contentParentObject[contentId] as any[]).forEach((item) => {
          item.parentFolderId &&
            (contentParentBaseObject[contentId].folder = { id: item.id, name: item.name });
          item.folderId && (contentParentBaseObject[contentId].file = { id: item.id, name: item.name });

          if (item.fileId) {
            contentParentBaseObject[contentId].content = Object.assign(
              {
                name: item.title,
                locales: _.filter(item.tags, (tag) => !_.isNil(tag.locale)),
              },
              _.pick(item, ['id', 'creator', 'createTime', 'updateTime']),
            );
            userIds.push(item.creator);
          }
          contentParentBaseObject[contentId].version = Object.assign(
            {},
            _.pick(version, ['id', 'version', 'versionNumber', 'createTime', 'updateTime']),
            { isLive: version.id === item.liveVersionId },
          );
        });
      }

      const userBaseObject = await this.service.user.getUserBaseObjectByIds(userIds);

      let componentUsedPages: any[] = [];
      (usedItemList[0].data as any[]).forEach((content) => {
        if (contentParentBaseObject[content._id]?.content?.creator) {
          contentParentBaseObject[content._id].content.creator =
            userBaseObject?.[contentParentBaseObject[content._id].content.creator] || {};
        }
        componentUsedPages.push(Object.assign({}, contentParentBaseObject[content._id]));
      });

      return Response.success(
        {
          pageInfo: this.paging(usedItemList[0]?.metadata?.[0]?.total || 0, pageSize),
          data: componentUsedPages,
        },
        1112801,
      );
    } catch (err) {
      return Response.error(err, i18n.component.getAppComponentFailed, 3112801);
    }
  }
}
