import _ from 'lodash';

import { Content, File, FileTypes, Folder } from '@foxpage/foxpage-server-types';

import { PRE, TAG, TYPE, VERSION } from '../../../config/constant';
import * as Model from '../../models';
import { FileContentAndVersion } from '../../types/content-types';
import {
  AppFileList,
  AppFileType,
  AppTypeFileParams,
  FileAssoc,
  FileInfo,
  FilePageSearch,
  FileUserInfo,
} from '../../types/file-types';
import { PageData, PageSize } from '../../types/index-types';
import { BaseService } from '../base-service';
import * as Service from '../index';

export class FileListService extends BaseService<File> {
  private static _instance: FileListService;

  constructor() {
    super(Model.file);
  }

  /**
   * Single instance
   * @returns FileListService
   */
  public static getInstance(): FileListService {
    this._instance || (this._instance = new FileListService());
    return this._instance;
  }

  /**
   * Get file list by folder ID
   * @param  {string} folderId
   * @param  {Partial<File>} options
   * @returns Promise
   */
  async getFileListByFolderId(folderId: string, options: Partial<File>): Promise<File[]> {
    return this.model.find(Object.assign({ folderId, deleted: false }, options));
  }

  /**
   * Get all file detail of the specified type under the specified application
   * @param  {AppTypeContent} params
   * @returns {string[]} Promise
   */
  async getAppTypeFileList(params: AppFileType): Promise<File[]> {
    return Model.file.getAppFileList(params);
  }

  /**
   * Get the details of the specified file list under the specified application
   * @param  {AppTypeContent} params
   * @returns {string[]} Promise
   */
  async getAppFileList(params: AppFileList): Promise<File[]> {
    return this.find({ applicationId: params.applicationId, id: { $in: params.ids }, deleted: false });
  }

  /**
   * Get file page data
   * @param  {FilePageSearch} params
   * @returns {FileUserInfo} Promise
   */
  async getPageData(params: FilePageSearch): Promise<PageData<FileUserInfo>> {
    const [fileList, fileCount] = await Promise.all([
      Model.file.getPageList(params),
      Model.file.getCount(params),
    ]);

    // Get the user information corresponding to the file
    const fileUserList = await Service.user.replaceDataUserId<File, FileInfo>(fileList);

    return { list: fileUserList, count: fileCount };
  }

  /**
   * Get file details by content id
   * @param  {string[]} contentIds
   * @returns Promise
   */
  async getContentFileByIds(contentIds: string[], applicationId?: string): Promise<Record<string, File>> {
    if (!contentIds || contentIds.length === 0) {
      return {};
    }

    let contentList = await Service.content.list.getDetailByIds(contentIds);
    // get and set content file id to reference id
    if (applicationId) {
      contentList = await Service.content.list.setContentReferenceFileId(
        applicationId as string,
        contentList,
      );
    }

    const fileList = await this.getDetailByIds(_.uniq(_.map(contentList, 'fileId')));
    const fileObject = _.keyBy(fileList, 'id');

    let contentFileObject: Record<string, File> = {};
    contentList.forEach((content) => {
      contentFileObject[content.id] = fileObject[content.fileId] || {};
      contentFileObject[content.id].componentType =
        (content as any).componentType || fileObject[content.fileId].componentType || '';
    });

    return contentFileObject;
  }

  /**
   * Get the paging list of files of the specified type under the application
   * @param  {AppTypeFileParams} params
   * @param  {Partial<PageSize>={}} page
   * @returns File
   */
  async getAppTypeFilePageList(params: AppTypeFileParams, pageInfo: PageSize): Promise<PageData<File>> {
    const filter: Record<string, any> = {
      applicationId: params.applicationId,
      type: params.type,
      deleted: false,
    };

    if (params.type === TYPE.CONDITION) {
      filter.subType = { $nin: ['timeDisplay', 'showHide'] };
    }

    if (params.search) {
      filter['$or'] = [{ name: { $regex: new RegExp(params.search, 'i') } }, { id: params.search }];
    }

    // filter application or the special folder items
    if (params.scopeId) {
      filter.folderId =
        !params.scope || params.scope === TYPE.APPLICATION ? params.scopeId : { $ne: params.scopeId };
    }

    const [fileCount, fileList] = await Promise.all([
      this.getCount(filter),
      this.find(filter, '', {
        sort: { _id: -1 },
        skip: (pageInfo.page - 1) * pageInfo.size,
        limit: pageInfo.size,
      }),
    ]);

    return { count: fileCount, list: fileList };
  }

  /**
   * Get the file plus name of the specified file, the creator information,
   * and the largest version information under the file
   * @param  {File[]} fileList
   * @param  {{type:string}} options Optional parameters of the file, type: file type
   * @returns Promise
   */
  async getFileAssocInfo(fileList: File[], options?: { type: string }): Promise<FileAssoc[]> {
    const fileType = options?.type || '';

    if (fileList.length === 0) {
      return [];
    }

    let [fileIds, folderIds, creatorIds] = <string[][]>[[], [], []];
    fileList.forEach((item) => {
      fileIds.push(item.id);
      folderIds.push(item.folderId);
      creatorIds.push(item.creator);
    });
    fileIds = _.uniq(fileIds);

    let promises: any[] = [
      Service.folder.list.getDetailByIds(_.uniq(folderIds)),
      Service.user.getUserBaseObjectByIds(_.uniq(creatorIds)),
      Service.store.goods.find({ 'details.id': { $in: fileIds }, status: 1, deleted: false }),
    ];

    // Only variable, condition, function and mock return content version value
    if ([TYPE.VARIABLE, TYPE.CONDITION, TYPE.FUNCTION, TYPE.MOCK].indexOf(fileType) !== -1) {
      promises.push(Service.version.list.getMaxVersionByFileIds(fileIds));
    } else {
      promises.push(Service.content.list.getContentObjectByFileIds(fileIds));
    }

    const [folderList, creatorObject, onlineList, contentObject] = await Promise.all(promises);

    let fileAssoc: FileAssoc[] = [];
    const folderObject: Record<string, Folder> = _.keyBy(folderList, 'id');
    const fileOnlineObject: Record<string, any> = _.keyBy(_.map(onlineList, 'details'), 'id');
    fileList.forEach((file) => {
      const folderName = folderObject?.[file.folderId]?.name || '';
      fileAssoc.push(
        Object.assign(_.omit(file, ['creator']), {
          contentId: contentObject[file.id]?.contentId || contentObject[file.id]?.id || '',
          folderName: _.startsWith(folderName, '__') ? '' : folderName, // The system folder returns empty by default
          content: contentObject[file.id]?.content || {},
          creator: creatorObject[file.creator] || {},
          online: !!fileOnlineObject[file.id],
          version: {
            base:
              contentObject[file.id]?.contentId && contentObject[file.id].status === VERSION.STATUS_BASE
                ? contentObject[file.id].version
                : '',
            live: contentObject[file.id]?.contentId
              ? ''
              : Service.version.number.getVersionFromNumber(contentObject[file.id]?.liveVersionNumber || 0),
          },
        }) as FileAssoc,
      );
    });

    return fileAssoc;
  }

  /**
   * Check the special files has been referenced in the application
   * @param  {string} applicationId
   * @param  {string[]} fileIds
   * @returns Promise
   */
  async getReferencedByIds(
    applicationId: string,
    fileIds: string[],
    type?: string,
  ): Promise<Record<string, File>> {
    const fileList = await this.find({
      applicationId,
      deleted: false,
      'tags.type': type || TAG.DELIVERY_REFERENCE,
      'tags.reference.id': { $in: fileIds },
    });
    const referenceFileObject: Record<string, File> = {};
    fileList.forEach((file) => {
      if (file.tags && file.tags[0].reference.id) {
        referenceFileObject[file.tags[0].reference.id] = file;
      }
    });

    return referenceFileObject;
  }

  /**
   * Get app item (variable, condition, function) list or project item list
   * if params.type is 'live' then get has live version's item
   *
   * response file, content and version detail, include relations detail
   * @param params {applicationId, folderId?, search?, type?, page?, size?}
   * @param type
   * @returns
   */
  async getItemFileContentDetail(
    params: any,
    type: FileTypes,
  ): Promise<{
    list: FileContentAndVersion[];
    counts: number;
  }> {
    let filter: Record<string, any> = { type };

    if (type === TYPE.CONDITION) {
      filter.subType = { $nin: ['timeDisplay', 'showHide'] };
    }

    if (params.search) {
      filter.name = { $regex: new RegExp(params.search, 'i') };
    }

    let fileList = await this.getFileListByFolderId(params.folderId, filter);

    // get live variable
    let fileIds = _.map(fileList, 'id');
    let fileContentList: Content[] = [];
    const contentList = await Service.content.file.getContentByFileIds(fileIds);
    if (params.type === 'live') {
      contentList.forEach((content) => {
        if (content.liveVersionNumber === 0) {
          _.pull(fileIds, content.fileId);
        } else {
          fileContentList.push(content);
        }
      });
    } else {
      fileContentList = contentList;
    }

    // filter valid file list
    fileList = _.filter(fileList, (file) => fileIds.indexOf(file.id) !== -1);

    let fileVersion: FileContentAndVersion[] = [];
    const pageFileList = _.chunk(fileList, params.size)[params.page - 1] || [];

    if (fileIds.length > 0) {
      // Get the live details of the content of the file
      let versionObject = await Service.version.list.getContentMaxVersionDetail(_.map(fileContentList, 'id'));
      const [versionItemRelation, contentGoodsList] = await Promise.all([
        Service.version.list.getVersionListRelations(_.toArray(versionObject), params.type === 'live'),
        Service.store.goods.getAppFileStatus(params.applicationId, _.map(pageFileList, 'id')),
      ]);
      const goodsStatusObject = _.keyBy(contentGoodsList, 'id');

      // Splicing combination returns data
      const fileContentObject = _.keyBy(fileContentList, 'fileId');
      for (const file of pageFileList) {
        const content = fileContentObject[file.id] || {};
        const itemRelations = await Service.relation.formatRelationDetailResponse(
          versionItemRelation[content.id],
        );

        fileVersion.push({
          id: file.id,
          name: file.name,
          type: file.type,
          version: versionObject?.[content.id]?.version || '',
          versionNumber: content.liveVersionNumber || versionObject?.[content.id]?.versionNumber,
          contentId: content.id,
          content: Object.assign(versionObject?.[content.id]?.content || {}, { id: content.id }),
          relations: itemRelations,
          online: goodsStatusObject[content.fileId]?.status ? true : false,
        });
      }
    }

    return { list: fileVersion, counts: fileList.length };
  }

  /**
   * get user involve file list
   * @param params
   * @returns
   */
  async getUserInvolveFiles(params: {
    applicationId: string;
    type: string;
    userId: string;
    search?: string;
    skip?: number;
    limit?: number;
  }): Promise<{ counts: number; list: File[] }> {
    const { applicationId = '', userId = '' } = params;
    const userInvolveItems = await Service.auth.find(
      {
        targetId: userId,
        allow: true,
        'relation.applicationId': applicationId,
        'relation.projectId': { $exists: true },
      },
      'relation',
    );

    let projectIds: string[] = [];
    let fileIds: string[] = [];
    userInvolveItems.forEach((item) => {
      if (item.relation?.fileId) {
        fileIds.push(item.relation.fileId);
      } else if (item.relation?.projectId) {
        projectIds.push(item.relation.projectId);
      }
    });

    const fileParams: Record<string, any> = {
      creator: { $ne: userId },
      type: params.type,
      deleted: false,
    };

    if (params.search && params.search.length === 20 && _.startsWith(params.search, PRE.FILE + '_')) {
      fileParams.id = params.search;
    } else {
      fileParams['$or'] = [];
      if (fileIds.length > 0) {
        fileParams['$or'].push({ id: { $in: _.uniq(fileIds) } });
      }

      if (projectIds.length > 0) {
        fileParams['$or'].push({ folderId: { $in: _.uniq(projectIds) } });
      }

      if (params.search) {
        fileParams.name = { $regex: new RegExp(params.search, 'i') };
      }
    }

    let counts = 0;
    let fileList: File[] = [];
    if (fileParams['$or']?.length > 0 || fileParams.id) {
      [counts, fileList] = await Promise.all([
        this.getCount(fileParams),
        this.find(fileParams, '', { skip: params.skip || 0, limit: params.limit || 10 }),
      ]);
    }

    return { counts, list: fileList };
  }
}
