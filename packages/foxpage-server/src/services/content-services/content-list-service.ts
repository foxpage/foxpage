import _ from 'lodash';
import pLimit from 'p-limit';

import { Content, ContentVersion, File } from '@foxpage/foxpage-server-types';

import { TAG } from '../../../config/constant';
import * as Model from '../../models';
import { ContentLiveVersion, FolderFileContent } from '../../types/content-types';
import { AppFileType } from '../../types/file-types';
import { BaseService } from '../base-service';
import * as Service from '../index';

export class ContentListService extends BaseService<Content> {
  private static _instance: ContentListService;

  constructor() {
    super(Model.content);
  }

  /**
   * Single instance
   * @returns ContentListService
   */
  public static getInstance(): ContentListService {
    this._instance || (this._instance = new ContentListService());
    return this._instance;
  }

  /**
   * Get all content information of the specified type under the specified application.
   * If the file is component file and it reference from store,
   * then need replace file id to get content info
   * @param  {AppFileType} params
   * @returns {Content} Promise
   */
  async getAppContentList(params: AppFileType): Promise<Content[]> {
    let contentList: Content[] = [];

    // Get all files id of the specified type under the App
    const fileList: File[] = await Service.file.list.getAppTypeFileList(params);

    if (fileList.length > 0) {
      // Check if file is a reference
      let referenceIdMap: Record<string, string> = {};
      let referenceLiveMap: Record<string, string> = {};
      fileList.forEach((file) => {
        const referenceTag = _.find(file.tags, (tag) => tag.type === TAG.DELIVERY_REFERENCE);
        if (referenceTag && referenceTag.reference?.id) {
          referenceIdMap[referenceTag.reference.id] = file.id;
          referenceLiveMap[referenceTag.reference.id] = referenceTag.reference.liveVersionId || '';
        }
      });

      // Concurrently 1 time each time, 200 fileIds are requested each time
      const referenceIds: string[] = _.keys(referenceIdMap);
      const fileIds = _.concat(_.pullAll(_.map(fileList, 'id'), _.values(referenceIdMap)), referenceIds);

      let promises: any[] = [];
      const limit = pLimit(1);
      _.chunk(fileIds, 200).forEach((fileIds) => {
        promises.push(limit(() => Model.content.getDetailByFileIds(fileIds)));
      });

      contentList = _.flatten(await Promise.all(promises));
      const fileObject = _.keyBy(fileList, 'id');
      let referenceFileObject: Record<string, File> = {};
      let referenceVersionObject: Record<string, ContentVersion> = {};
      if (referenceIds.length > 0) {
        const [referenceFileList, referenceVersionList] = await Promise.all([
          Service.file.list.getDetailByIds(referenceIds),
          Service.version.list.getDetailByIds(_.pull(_.values(referenceLiveMap), '')),
        ]);
        referenceFileObject = _.keyBy(referenceFileList, 'id');
        referenceVersionObject = _.keyBy(referenceVersionList, 'id');
      }

      contentList.forEach((content) => {
        const fileId = referenceIdMap[content.fileId] || content.fileId;
        const referenceId = fileId !== content.fileId ? content.fileId : '';
        const deprecatedTag = _.find(fileObject[fileId]?.tags || [], (tag) => tag.type === TAG.DEPRECATED);
        const referenceDeprecatedTag = _.find(
          referenceFileObject[referenceId]?.tags || [],
          (tag) => tag.type === TAG.DEPRECATED,
        );

        (<any>content).deprecated = (deprecatedTag?.status | referenceDeprecatedTag?.status) === 1;

        // response reference live version
        if (fileId && referenceLiveMap[content.fileId]) {
          content.liveVersionId = referenceLiveMap[content.fileId];
          content.liveVersionNumber = referenceVersionObject[referenceLiveMap[content.fileId]]?.versionNumber;
        }
      });
    }

    return contentList;
  }

  /**
   * Get the corresponding content and version details through fileIds
   * @param  {string[]} fileIds
   * @returns ContentVersion
   */
  async getContentAndVersionListByFileIds(
    fileIds: string[],
  ): Promise<{ contentList: Content[]; versionList: ContentVersion[] }> {
    let versionList: ContentVersion[] = [];
    const contentList = await Service.content.file.getContentByFileIds(fileIds);
    if (contentList.length > 0) {
      versionList = await Service.version.list.getDetailByIds(_.map(contentList, 'id'));
    }
    return { contentList: contentList, versionList };
  }

  /**
   * Get the first validate content in file, sort by create time asc
   * @param fileIds
   * @returns
   */
  async getFirstContentByFileIds(fileIds: string[]): Promise<Record<string, Content>> {
    if (fileIds.length === 0) {
      return {};
    }

    const contentList = await this.find({ fileId: { $in: fileIds }, deleted: false }, '', {
      sort: { _id: 1 },
    });
    let fileContentObject: Record<string, Content> = {};
    contentList.forEach((content) => {
      if (!fileContentObject[content.fileId]) {
        fileContentObject[content.fileId] = content;
      }
    });
    return fileContentObject;
  }

  /**
   * Get file content list
   * @param fileIds
   * @returns
   */
  async getFileContentList(
    fileIds: string[],
    options?: { fileList?: File[] },
  ): Promise<Record<string, Content[]>> {
    if (fileIds.length === 0) {
      return {};
    }

    let fileList = options?.fileList || [];
    if (!fileList || fileList.length === 0) {
      fileList = await Service.file.list.getDetailByIds(fileIds);
    }

    // Get reference file ids
    const referenceFileMap = Service.file.info.filterReferenceFile(fileList);
    const contentList = await Service.content.file.getContentByFileIds(
      _.concat(fileIds, _.keys(referenceFileMap)),
    );

    let fileContentList: Record<string, Content[]> = {};
    contentList.forEach((content) => {
      const fileId = referenceFileMap[content.fileId] || content.fileId;
      !fileContentList[fileId] && (fileContentList[fileId] = []);
      fileContentList[fileId].push(Object.assign({}, content, { fileId }));
    });

    return fileContentList;
  }

  /**
   * Get content details through fileId,
   * only support the situation that there is only one content under the fileId
   * Return content details with fileId as the key name
   * @param  {string[]} fileIds
   * @returns Promise
   */
  async getContentObjectByFileIds(fileIds: string[]): Promise<Record<string, Content>> {
    if (fileIds.length === 0) {
      return {};
    }

    const contentList = await Service.content.file.getContentByFileIds(fileIds);
    return _.keyBy(contentList, 'fileId');
  }

  /**
   * Get content live number information through contentIds
   * @param  {string[]} contentIds
   * @returns {ContentLiveVersion[]} Promise
   */
  async getContentLiveInfoByIds(contentIds: string[]): Promise<ContentLiveVersion[]> {
    if (contentIds.length === 0) {
      return [];
    }
    return Model.content.getContentLiveInfoByIds(contentIds);
  }

  /**
   * Get all the superior information of the specified content, including files and folders
   * @param  {string[]} contentIds
   * @returns Promise
   */
  async getContentAllParents(contentIds: string[]): Promise<Record<string, FolderFileContent[]>> {
    const contentList = await this.getDetailByIds(contentIds);

    const fileList = await Service.file.list.getDetailByIds(_.uniq(_.map(contentList, 'fileId')));
    const folderIds = _.map(fileList, 'folderId');
    const fileObject = _.keyBy(fileList, 'id');

    const allParentFolderList = await Service.folder.list.getAllParentsRecursive(folderIds);

    let contentParents: Record<string, FolderFileContent[]> = {};
    for (const content of contentList) {
      let data: any = [content];
      if (fileObject[content.fileId]) {
        data.unshift(fileObject[content.fileId]);
      }

      if (allParentFolderList[fileObject[content.fileId].folderId]) {
        data.unshift(...allParentFolderList[fileObject[content.fileId].folderId]);
      }

      contentParents[content.id] = data;
    }

    return contentParents;
  }

  /**
   * Get content id, and get the content reference file id
   * then, set the content info's fileId to reference file id
   * @param contentList
   * @returns
   */
  async setContentReferenceFileId(applicationId: string, contentList: Content[]): Promise<Content[]> {
    const fileIds = _.map(contentList, 'fileId');
    const fileContentObject = _.keyBy(contentList, 'fileId');
    if (fileIds.length > 0) {
      const fileList = await Service.file.list.find({
        applicationId,
        deleted: false,
        'tags.reference.id': { $in: fileIds },
      });

      (fileList || []).forEach((file) => {
        const referenceFileTag = _.find(file.tags, { type: TAG.DELIVERY_REFERENCE });
        if (referenceFileTag?.reference?.id && fileContentObject[referenceFileTag.reference.id]) {
          fileContentObject[referenceFileTag.reference.id].fileId = file.id;
        }
      });
    }

    return _.toArray(fileContentObject);
  }

  /**
   * Get the content live version id by content Ids
   * @param contentIds
   * @returns
   */
  async getContentLiveIds(contentIds: string[]): Promise<Record<string, string>> {
    const contentList = await this.getDetailByIds(contentIds);
    let contentLiveIdMap: Record<string, string> = {};
    contentList.map((content) => {
      if (content.liveVersionId) {
        contentLiveIdMap[content.id] = content.liveVersionId;
      }
    });

    return contentLiveIdMap;
  }

  /**
   * Get content list by ids,
   * if the content is reference, then get the reference info (live version id)
   * @param params
   * @returns
   */
  async getContentInfo(params: { applicationId: string; contentIds: string[] }): Promise<Content[]> {
    let contentList = await Service.content.list.getDetailByIds(params.contentIds);
    contentList = _.filter(contentList, { deleted: false });
    const fileIds = _.map(contentList, 'fileId');

    // Get the reference infos
    const referenceFileList = await Service.file.list.find({
      tags: { $elemMatch: { type: TAG.DELIVERY_REFERENCE, 'reference.id': { $in: fileIds } } },
      applicationId: params.applicationId,
    });

    let referenceObject: Record<string, any> = {};
    referenceFileList.forEach((item) => {
      const referenceTag = _.find(item.tags, { type: TAG.DELIVERY_REFERENCE });
      referenceTag.type && (referenceObject[referenceTag.reference.id] = referenceTag?.reference);
    });

    let referenceList: Content[] = [];
    contentList.forEach((content) => {
      if (referenceObject[content.fileId] && referenceObject[content.fileId].liveVersionId) {
        referenceList.push(
          Object.assign({}, content, {
            liveVersionId: referenceObject[content.fileId].liveVersionId,
            liveVersionNumber: Service.version.number.createNumberFromVersion(
              referenceObject[content.fileId].liveVersion,
            ),
          }),
        );
      } else {
        referenceList.push(content);
      }
    });

    return referenceList;
  }
}
