import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import {} from '../../types/file-types';
import { ResData } from '../../types/index-types';
import { GetProjectItemsReq } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('projects')
export class GetProjectItemsList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get page items in project, include project, project file, and project content
   * @param  {GetProjectItemsReq} params
   * @param  {Header} headers
   * @returns {FileFolderInfo}
   */
  @Get('/items')
  @OpenAPI({
    summary: i18n.sw.getPageProjectItems,
    description: '',
    tags: ['Project'],
    operationId: 'get-page-project-items',
  })
  // @ResponseSchema(FileFolderListRes)
  async index(@QueryParams() params: GetProjectItemsReq): Promise<ResData<any>> {
    const search = _.trim(params.search || '');
    try {
      // set filter query
      const pageSize = this.service.folder.info.setPageSize(params);

      let applicationIds: string[] = [];
      if (!params.applicationId) {
        const appList = await this.service.application.find({
          organizationId: params.organizationId,
          deleted: false,
        });
        applicationIds = _.map(appList, 'id');
      } else {
        applicationIds = [params.applicationId];
      }

      if (applicationIds.length === 0) {
        return Response.success(
          { pageInfo: this.paging(0, pageSize), data: { folders: [], files: [], contents: [] } },
          1200202,
        );
      }

      const folderSearch: Record<string, any> = {
        applicationId: applicationIds.length > 1 ? { $in: applicationIds } : applicationIds[0],
        deleted: false,
        'tags.type': TYPE.PROJECT_FOLDER,
      };
      const fileSearch: Record<string, any> = {
        applicationId: applicationIds.length > 1 ? { $in: applicationIds } : applicationIds[0],
        deleted: false,
        type: { $in: [TYPE.PAGE, TYPE.TEMPLATE] },
      };
      const contentSearch: Record<string, any>[] = [
        {
          $lookup: {
            from: 'fp_application_file',
            localField: 'fileId',
            foreignField: 'id',
            as: 'file',
          },
        },
        {
          $match: {
            'file.applicationId': applicationIds.length > 1 ? { $in: applicationIds } : applicationIds[0],
            'file.deleted': false,
            'file.type': { $in: [TYPE.PAGE, TYPE.TEMPLATE] },
            deleted: false,
          },
        },
      ];

      // add search parameter if search is valid
      if (search) {
        folderSearch['$or'] = [{ id: search }, { name: { $regex: new RegExp(search, 'i') } }];
        fileSearch['$or'] = [{ id: search }, { name: { $regex: new RegExp(search, 'i') } }];
        contentSearch[1]['$match']['$or'] = [{ id: search }, { title: { $regex: new RegExp(search, 'i') } }];
      }

      const contentCountSearch = _.cloneDeep(contentSearch);
      contentCountSearch.push({ $group: { _id: null, count: { $sum: 1 } } });

      const result = await Promise.all([
        this.service.folder.list.getCount(folderSearch),
        this.service.file.list.getCount(fileSearch),
        this.service.content.list.aggregate(contentCountSearch),
      ]);

      const folderCount = result[0] || 0;
      const fileCount = result[1] || 0;
      const contentCount = result[2]?.[0]?.count || 0;
      const folderFileCount = folderCount + fileCount;
      const from = (pageSize.page - 1) * pageSize.size;
      const to = pageSize.page * pageSize.size;

      let projectItemsPromise: Promise<any>[] = [];
      if (folderCount > 0 && from < folderCount) {
        projectItemsPromise[0] = this.service.folder.list.find(folderSearch, '', {
          skip: from,
          limit: pageSize.size,
        });
      } else {
        projectItemsPromise[0] = new Promise((resolve) => {
          return resolve([]);
        });
      }

      if (
        fileCount > 0 &&
        ((from < folderCount && to > folderCount) || (from >= folderCount && from < folderFileCount))
      ) {
        const skip = from < folderCount ? 0 : from - folderCount;
        const limit = from < folderCount ? to - folderCount : pageSize.size;
        projectItemsPromise[1] = this.service.file.list.find(fileSearch, '', { skip, limit });
      } else {
        projectItemsPromise[1] = new Promise((resolve) => {
          return resolve([]);
        });
      }

      if (contentCount > 0 && to > folderFileCount) {
        const skip = from < folderFileCount ? 0 : from - folderFileCount;
        const limit = from < folderFileCount ? to - folderFileCount : pageSize.size;
        contentSearch.push(...[{ $sort: { createTime: -1 } }, { $skip: skip }, { $limit: limit }]);
        projectItemsPromise[2] = this.service.content.list.aggregate(contentSearch);
      } else {
        projectItemsPromise[2] = new Promise((resolve) => {
          return resolve([]);
        });
      }

      const [folderList, fileList, contentList] = await Promise.all(projectItemsPromise);
      const userIds = _.uniq(
        _.concat(_.map(folderList, 'creator'), _.map(fileList, 'creator'), _.map(contentList, 'creator')),
      );

      const contentFileIds = _.map(contentList, 'fileId');

      // get app and user info
      const [appList, userObject, contentFileList] = await Promise.all([
        this.service.application.getDetailByIds(applicationIds),
        this.service.user.getUserBaseObjectByIds(userIds),
        this.service.file.list.getDetailByIds(contentFileIds),
      ]);

      const fileFolderIds = _.concat(_.map(fileList, 'folderId'), _.map(contentFileList, 'folderId'));
      const fileFolderList = await this.service.folder.list.getDetailByIds(fileFolderIds);
      const appObject = _.keyBy(appList, 'id');
      const contentFileObject = _.keyBy(contentFileList, 'id');
      const fileFolderObject = _.keyBy(fileFolderList, 'id');

      return Response.success(
        {
          pageInfo: this.paging(folderFileCount + contentCount, pageSize),
          data: {
            folders: _.map(folderList, (folder) => {
              return Object.assign({}, _.omit(folder, ['applicationId', 'creator']), {
                application: _.pick(appObject[folder.applicationId], ['id', 'name']),
                creator: userObject[folder.creator],
              });
            }),
            files: _.map(fileList, (file) => {
              return Object.assign({}, _.omit(file, ['applicationId', 'creator']), {
                application: _.pick(appObject[file.applicationId], ['id', 'name']),
                folder: _.pick(fileFolderObject[file.folderId], ['id', 'name']),
                creator: userObject[file.creator],
              });
            }),
            contents: _.map(contentList, (content) => {
              return Object.assign({}, _.omit(content, ['creator', '_id', 'file']), {
                creator: userObject[content.creator],
                file: _.pick(content.file[0] || {}, ['id', 'name']),
                folder: _.pick(fileFolderObject[contentFileObject[content.fileId].folderId], ['id', 'name']),
                application: _.pick(appObject[contentFileObject[content.fileId].applicationId], [
                  'id',
                  'name',
                ]),
              });
            }),
          },
        },
        1200201,
      );
    } catch (err) {
      return Response.error(err, i18n.project.getChildrenFilesFailed, 3200201);
    }
  }
}
