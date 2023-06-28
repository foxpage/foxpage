import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { UserBase } from 'src/types/user-types';

import { Application, File, Folder } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { COLLECT, TYPE } from '../../../config/constant';
import { FoxCtx, IdName, ResData } from '../../types/index-types';
import { AppContentListRes, PageTypeSearchReq } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

const PROJECT_VARIABLE = 'project_variable';
const PROJECT_CONDITION = 'project_condition';
const PROJECT_FUNCTION = 'project_function';
const PROJECT_CONTENT = 'project_content';
const FILE_CONTENT = 'file_content';
const PAGE_TEMPLATE = 'page_template';

interface SearchResult {
  id: string;
  name: string;
  type: string;
  level: string;
  parent: Record<string, any>;
  application: IdName;
  organization: IdName;
  creator: UserBase;
  createTime: string;
  updateTime: string;
}

@JsonController('search')
export class GetTypeItemList extends BaseController {
  constructor() {
    super();
  }

  /**
   * @param  {AppTypeFilesReq} params
   * @returns {PageContentData[]}
   */
  @Get('')
  @OpenAPI({
    summary: i18n.sw.getAppTypeFileList,
    description: '',
    tags: ['Page'],
    operationId: 'get-app-type-file-list-v2',
  })
  @ResponseSchema(AppContentListRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @QueryParams() params: PageTypeSearchReq,
  ): Promise<ResData<SearchResult[]>> {
    const { organizationId = '', applicationId = '', type = '', typeId = '', userType = '' } = params;
    const search = params.search ? _.trim(params.search) : '';
    let applicationIds: string[] = [];

    try {
      const pageSize = this.service.file.list.setPageSize(params);
      const skip = (pageSize.page - 1) * pageSize.size;

      let applicationList: Application[] = [];
      if (!applicationId) {
        applicationList = await this.service.application.find({ organizationId, deleted: false }, 'id name');
        applicationIds = _.map(applicationList, 'id');
      } else {
        applicationList[0] = await this.service.application.getDetailById(applicationId);
      }

      let level = '';
      let counts = 0;
      let list: any[] = [];
      let folderIds: string[] = [];
      let fileIds: string[] = [];
      const filterOptions = { sort: { _id: -1 }, skip: skip, limit: pageSize.size };

      if (userType === TYPE.INVOLVE) {
        const userInvolveItems = await this.getUserInvolveItems(ctx.userInfo.id, applicationIds, params);
        counts = userInvolveItems.counts;
        list = userInvolveItems.list;
        fileIds = userInvolveItems.fileIds;
        folderIds = userInvolveItems.folderIds;
        level = userInvolveItems.level;
      } else {
        const searchParams: Record<string, any> = {
          deleted: false,
        };
        userType === TYPE.USER && (searchParams.creator = ctx.userInfo.id);

        switch (type) {
          case TYPE.PROJECT:
            level = TYPE.FOLDER;
            searchParams['$and'] = [];
            if (userType !== TYPE.USER) {
              applicationId
                ? (searchParams['$and'] = [{ applicationId }])
                : (searchParams['$and'] = [
                    {
                      $or: [
                        { applicationId: { $in: applicationIds } },
                        { tags: { $elemMatch: { type: TYPE.ORGANIZATION, typeId: params.organizationId } } },
                      ],
                    },
                  ]);
            }

            searchParams['tags.type'] = TYPE.PROJECT_FOLDER;
            search &&
              searchParams['$and'].push({
                $or: [{ id: search }, { name: { $regex: new RegExp(search, 'i') } }],
              });
            searchParams['$and'].length === 0 && delete searchParams['$and'];
            [counts, list] = await Promise.all([
              this.service.folder.list.getCount(searchParams),
              this.service.folder.list.find(searchParams, '', filterOptions),
            ]);
            break;
          case TYPE.PAGE:
          case TYPE.TEMPLATE:
          case TYPE.BLOCK:
          case TYPE.VARIABLE:
          case TYPE.CONDITION:
          case TYPE.FUNCTION:
          case TYPE.COMPONENT:
          case TYPE.RESOURCE:
          case TYPE.EDITOR:
          case PROJECT_VARIABLE:
          case PROJECT_CONDITION:
          case PROJECT_FUNCTION:
            level = TYPE.FILE;
            searchParams.type = type;
            searchParams.applicationId = applicationId || { $in: applicationIds };

            // get the apps default folder list
            const appDefaultFolders = await this.service.folder.list.find(
              { applicationId: applicationId || { $in: applicationIds }, deleted: false, parentFolderId: '' },
              'id',
            );
            const appDefaultFolderIds = _.map(appDefaultFolders, 'id');
            if ([TYPE.VARIABLE, TYPE.CONDITION, TYPE.FUNCTION, TYPE.COMPONENT].indexOf(type) !== -1) {
              searchParams.folderId = { $in: appDefaultFolderIds };
            } else if ([PROJECT_VARIABLE, PROJECT_CONDITION, PROJECT_FUNCTION].indexOf(type) !== -1) {
              const dataTypeArr = type.split('_');
              searchParams.type = dataTypeArr[1];
              searchParams.folderId = typeId || { $nin: appDefaultFolderIds };
            }

            search && (searchParams['$or'] = [{ id: search }, { name: { $regex: new RegExp(search, 'i') } }]);
            [counts, list] = await Promise.all([
              this.service.file.list.getCount(searchParams),
              this.service.file.list.find(searchParams, '', filterOptions),
            ]);
            folderIds = _.map(list, 'folderId');
            break;
          case PAGE_TEMPLATE:
            level = TYPE.FILE;
            typeId && (searchParams.folderId = typeId);
            searchParams.type = { $in: [TYPE.PAGE, TYPE.TEMPLATE, TYPE.BLOCK] };
            searchParams['folder.deleted'] = false;
            searchParams['$and'] = [];
            if (userType !== TYPE.USER) {
              applicationId
                ? (searchParams['$and'] = [{ applicationId }])
                : (searchParams['$and'] = [
                    {
                      $or: [
                        { applicationId: { $in: applicationIds } },
                        {
                          'folder.tags': {
                            $elemMatch: { type: TYPE.ORGANIZATION, typeId: params.organizationId },
                          },
                        },
                      ],
                    },
                  ]);
            }
            search &&
              searchParams['$and'].push({
                $or: [{ id: search }, { name: { $regex: new RegExp(search, 'i') } }],
              });

            const fileAggregate = [
              { $lookup: { from: COLLECT.FOLD, localField: 'folderId', foreignField: 'id', as: 'folder' } },
              { $match: searchParams },
            ];
            searchParams['$and'].length === 0 && delete searchParams['$and'];
            const [fileAggerCounts, fileAggerData] = await Promise.all([
              this.service.file.info.aggregate(_.concat(fileAggregate, [{ $count: 'count' }] as any[])),
              this.service.file.info.aggregate(
                _.concat(fileAggregate, [
                  { $sort: { _id: -1 } },
                  {
                    $facet: {
                      // eslint-disable-next-line camelcase
                      metadata: [{ $count: 'total' }, { $addFields: { current_page: pageSize.page } }],
                      data: [{ $skip: skip }, { $limit: pageSize.size }],
                    },
                  },
                ] as any[]),
              ),
            ]);
            counts = fileAggerCounts[0]?.count || 0;
            list = fileAggerData[0]?.data || [];
            folderIds = _.map(fileAggerData[0]?.data, 'folderId');
            break;
          case PROJECT_CONTENT:
          case FILE_CONTENT:
            level = TYPE.CONTENT;
            searchParams.type = { $in: [TYPE.PAGE, TYPE.TEMPLATE, TYPE.BLOCK] };
            searchParams.applicationId = applicationId || { $in: applicationIds };

            if (type === PROJECT_CONTENT && typeId) {
              const fileList = await this.service.file.list.find({
                folderId: typeId,
                deleted: false,
                type: { $in: [TYPE.PAGE, TYPE.TEMPLATE, TYPE.BLOCK] },
              });
              searchParams.fileId = { $in: _.map(fileList, 'id') };
            } else if (type === FILE_CONTENT && typeId) {
              searchParams.fileId = typeId;
            }

            search &&
              (searchParams['$or'] = [{ id: search }, { title: { $regex: new RegExp(search, 'i') } }]);
            [counts, list] = await Promise.all([
              this.service.content.list.getCount(searchParams),
              this.service.content.list.find(searchParams, '', filterOptions),
            ]);
            fileIds = _.map(list, 'fileId');
            break;
          case TYPE.CONTENT:
            level = TYPE.CONTENT;
            searchParams.type = { $in: [TYPE.PAGE, TYPE.TEMPLATE, TYPE.BLOCK] };
            searchParams['$and'] = [];
            if (userType !== TYPE.USER) {
              applicationId
                ? (searchParams['$and'] = [{ applicationId }])
                : (searchParams['$and'] = [
                    {
                      $or: [
                        { applicationId: { $in: applicationIds } },
                        {
                          'folder.tags': {
                            $elemMatch: { type: TYPE.ORGANIZATION, typeId: params.organizationId },
                          },
                        },
                      ],
                    },
                  ]);
            }
            search &&
              searchParams['$and'].push({
                $or: [{ id: search }, { title: { $regex: new RegExp(search, 'i') } }],
              });
            searchParams['file.deleted'] = false;
            searchParams['folder.deleted'] = false;
            searchParams['$and'].length === 0 && delete searchParams['$and'];
            const contentAggregate = [
              { $lookup: { from: COLLECT.FILE, localField: 'fileId', foreignField: 'id', as: 'file' } },
              {
                $lookup: {
                  from: COLLECT.FOLD,
                  localField: 'file.folderId',
                  foreignField: 'id',
                  as: 'folder',
                },
              },
              { $match: searchParams },
            ];
            const [contentAggerCounts, contentAggerData] = await Promise.all([
              this.service.content.info.aggregate(_.concat(contentAggregate, [{ $count: 'count' }] as any[])),
              this.service.content.info.aggregate(
                _.concat(contentAggregate, [
                  { $sort: { _id: -1 } },
                  {
                    $facet: {
                      // eslint-disable-next-line camelcase
                      metadata: [{ $count: 'total' }, { $addFields: { current_page: pageSize.page } }],
                      data: [{ $skip: skip }, { $limit: pageSize.size }],
                    },
                  },
                ] as any[]),
              ),
            ]);
            counts = contentAggerCounts[0]?.count || 0;
            list = contentAggerData[0]?.data || [];
            fileIds = _.map(contentAggerData[0]?.data, 'fileId');
            break;
        }
      }

      let searchList: SearchResult[] = [];

      // get list data creator, application and path
      if (list.length > 0) {
        let fileList: File[] = [];
        let folderList: Folder[] = [];
        if (fileIds.length > 0) {
          fileList = await this.service.file.list.getDetailByIds(fileIds);
          folderIds = _.map(fileList, 'folderId');
        }

        let userObject: Record<string, UserBase> = {};
        [folderList, userObject, applicationList] = await Promise.all([
          this.service.folder.list.getDetailByIds(folderIds),
          this.service.user.getUserBaseObjectByIds(_.uniq(_.map(list, 'creator'))),
          this.service.application.getDetailByIds(_.concat(applicationIds, _.map(list, 'applicationId'))),
        ]);

        const orgList = await this.service.org.getDetailByIds(_.map(applicationList, 'organizationId'));

        const orgObject = _.keyBy(orgList, 'id');
        const appObject = _.keyBy(applicationList, 'id');
        const fileObject = _.keyBy(fileList, 'id');
        const folderObject = _.keyBy(folderList, 'id');

        list.forEach((item) => {
          const folderId = fileObject[item.fileId]?.folderId || item.folderId;
          searchList.push({
            id: item.id,
            name: item.title || item.name,
            type: item.type || type,
            level,
            parent: Object.assign(
              fileObject[item.fileId]
                ? { fileId: fileObject[item.fileId].id, fileName: fileObject[item.fileId].name }
                : {},
              folderObject[folderId] && !_.startsWith(folderObject[folderId].name, '_') // exclude system default folder
                ? { folderId: folderObject[folderId].id, folderName: folderObject[folderId].name }
                : {},
            ),
            application: _.pick(appObject[item.applicationId] || {}, ['id', 'name']),
            organization: _.pick(orgObject[appObject[item.applicationId]?.organizationId], ['id', 'name']),
            creator: userObject[item.creator] || {},
            createTime: item.createTime,
            updateTime: item.updateTime,
          });
        });
      }

      return Response.success(
        {
          pageInfo: this.paging(counts, pageSize),
          data: searchList,
        },
        1171001,
      );
    } catch (err) {
      return Response.error(err, i18n.page.getAppPageFileFailed, 3171001);
    }
  }

  /**
   * Get user involve items. include project, file and content data
   * @param userId
   * @param applicationIds
   * @param params
   * @returns
   */
  async getUserInvolveItems(
    userId: string,
    applicationIds: string[],
    params: PageTypeSearchReq,
  ): Promise<{ level: string; counts: number; list: any[]; fileIds: string[]; folderIds: string[] }> {
    let lookup: Record<string, string> = {};
    let partMatch: Record<string, any> = {};
    let fileIds: string[] = [];
    let folderIds: string[] = [];
    let selectField: string = '';
    let level: string = '';
    const isContentType = [TYPE.CONTENT, FILE_CONTENT, PROJECT_CONTENT].indexOf(params.type) !== -1;
    const pageSize = this.service.file.list.setPageSize(params);
    if (params.type === TYPE.PROJECT) {
      lookup = { from: COLLECT.FOLD, localField: 'relation.projectId', foreignField: 'id', as: 'item' };
      partMatch = { 'relation.projectId': { $exists: true }, 'item.tags.type': TYPE.PROJECT_FOLDER };
      selectField = 'relation.projectId';
      level = TYPE.FOLDER;
    } else if (params.type === PAGE_TEMPLATE) {
      lookup = { from: COLLECT.FILE, localField: 'relation.fileId', foreignField: 'id', as: 'item' };
      partMatch = {
        'relation.fileId': { $exists: true },
        'item.type': { $in: [TYPE.PAGE, TYPE.TEMPLATE, TYPE.BLOCK] },
      };
      params.typeId && (partMatch['relation.projectId'] = params.typeId);
      selectField = 'relation.fileId';
      level = TYPE.FILE;
    } else if (isContentType) {
      lookup = { from: COLLECT.CONTENT, localField: 'relation.contentId', foreignField: 'id', as: 'item' };
      partMatch = {
        'relation.contentId': { $exists: true },
        'item.type': { $in: [TYPE.PAGE, TYPE.TEMPLATE, TYPE.BLOCK] },
      };
      params.type === PROJECT_CONTENT && params.typeId && (partMatch['relation.projectId'] = params.typeId);
      params.type === FILE_CONTENT && params.typeId && (partMatch['relation.fileId'] = params.typeId);
      selectField = 'relation.contentId';
      level = TYPE.CONTENT;
    } else {
      return { level: '', counts: 0, list: [], fileIds, folderIds };
    }

    const aggregateObject: any[] = [
      { $lookup: lookup },
      {
        $match: Object.assign(
          { targetId: userId, allow: true, deleted: false, 'item.deleted': false },
          partMatch,
        ),
      },
      { $project: { [selectField]: 1 } },
      { $group: { _id: '$' + selectField } },
      {
        $facet: {
          // eslint-disable-next-line camelcase
          metadata: [{ $count: 'total' }, { $addFields: { current_page: pageSize.page } }],
          data: [{ $skip: (pageSize.page - 1) * pageSize.size }, { $limit: pageSize.size }],
        },
      },
    ];

    if (params.search) {
      aggregateObject[1]['$match']['$or'] = [
        {
          [isContentType ? 'item.title' : 'item.name']: {
            $regex: new RegExp(_.trim(params.search) || '', 'i'),
          },
        },
        { 'item.id': _.trim(params.search) },
      ];
    }

    if (applicationIds && applicationIds.length > 0) {
      aggregateObject[1]['$match']['relation.applicationId'] = { $in: applicationIds };
    }

    const involveProjects = await this.service.auth.aggregate(aggregateObject);
    const itemIds = _.map(involveProjects[0]?.data, '_id');
    let list: any[] = [];
    if (itemIds.length > 0) {
      if (params.type === TYPE.PROJECT) {
        list = await this.service.folder.list.getDetailByIds(itemIds);
      } else if (params.type === PAGE_TEMPLATE) {
        list = await this.service.file.list.getDetailByIds(itemIds);
        folderIds = _.map(list, 'folderId');
      } else if (isContentType) {
        list = await this.service.content.list.getDetailByIds(itemIds);
        fileIds = _.map(list, 'fileId');
      }
    }

    return {
      level,
      counts: involveProjects[0]?.metadata[0]?.total || 0,
      list: _.orderBy(list, { createTime: -1 }),
      fileIds,
      folderIds,
    };
  }
}
