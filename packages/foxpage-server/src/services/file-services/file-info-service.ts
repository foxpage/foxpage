import _ from 'lodash';

import { Content, ContentVersion, DSL, File, FileTypes } from '@foxpage/foxpage-server-types';

import { CONT_STORE, LOG, PRE, TAG, TYPE } from '../../../config/constant';
import * as Model from '../../models';
import {
  AppTypeFileUpdate,
  FileCheck,
  FileContentVersion,
  FileFolderContentChildren,
  FileNameSearch,
  FilePathSearch,
  FolderChildren,
  NewFileInfo,
} from '../../types/file-types';
import { FoxCtx, TypeStatus } from '../../types/index-types';
import { generationId, randStr } from '../../utils/tools';
import { FileServiceAbstract } from '../abstracts/file-service-abstract';
import * as Service from '../index';

export class FileInfoService extends FileServiceAbstract {
  private static _instance: FileInfoService;

  constructor() {
    super();
  }

  /**
   * Single instance
   * @returns ContentInfoService
   */
  public static getInstance(): FileInfoService {
    this._instance || (this._instance = new FileInfoService());
    return this._instance;
  }

  /**
   * Add file details, only generate query statements needed for transactions,
   * and return the details of the created content
   * @param  {Partial<File>} params
   * @returns File
   */
  create(params: Partial<File>, options: { ctx: FoxCtx }): File {
    const fileDetail: File = {
      id: params.id || generationId(PRE.FILE),
      applicationId: params.applicationId || '',
      name: _.trim(params.name) || '',
      intro: params.intro || '',
      suffix: params.suffix || '',
      folderId: params.folderId || '',
      tags: params.tags || [],
      type: params.type as FileTypes,
      creator: params.creator || options.ctx.userInfo.id,
    };

    options.ctx.transactions.push(Model.file.addDetailQuery(fileDetail));
    options.ctx.operations.push(
      ...Service.log.addLogItem(LOG.CREATE, fileDetail, { dataType: fileDetail.type }),
    );

    return fileDetail;
  }

  /**
   * Create file details, the content of the specified type file, version information
   * @param  {NewFileInfo} params
   * @returns Record
   */
  async addFileDetail(
    params: NewFileInfo,
    options: { ctx: FoxCtx },
  ): Promise<Record<string, number | (File & { contentId: string })>> {
    const newFileCheck = _.pick(params, ['applicationId', 'folderId', 'name', 'type', 'suffix']) as FileCheck;
    newFileCheck.deleted = false;
    const [appDetail, fileExist] = await Promise.all([
      Service.application.getDetailById(params.applicationId),
      this.checkExist(newFileCheck),
    ]);

    // Check the validity of the application ID, check the existence of the file
    if (!appDetail || appDetail.deleted || fileExist) {
      return fileExist ? { code: 2 } : { code: 1 };
    }

    // Check if pathname is duplicate
    if (params.type === TYPE.PAGE) {
      const pathnameExist = await Service.file.check.pathNameExist({
        applicationId: params.applicationId,
        tags: params.tags || [],
        fileId: '',
      });
      if (pathnameExist) {
        return { code: 3 }; // pathname already exists
      }
    }

    // Create document details
    const fileDetail: File = {
      id: generationId(PRE.FILE),
      applicationId: params.applicationId,
      name: params.name,
      intro: params.intro || '',
      folderId: params.folderId || '',
      type: params.type as FileTypes,
      tags: params.tags || [],
      suffix: params.suffix || '',
      creator: params.creator || options.ctx.userInfo.id,
    };

    options.ctx.transactions.push(Model.file.addDetailQuery(fileDetail));
    options.ctx.operations.push(...Service.log.addLogItem(LOG.CREATE, fileDetail, { dataType: params.type }));

    const fileContentDetail = Object.assign({}, fileDetail, { contentId: '' });
    // Create content details
    if ([TYPE.PAGE, TYPE.TEMPLATE].indexOf(params.type) === -1) {
      const contentDetail = Service.content.info.addContentDetail(
        { title: params.name, fileId: fileDetail.id },
        { ctx: options.ctx, type: params.type, content: params.content },
      );

      fileContentDetail.contentId = contentDetail.id;
    }

    return { code: 0, data: fileContentDetail };
  }

  /**
   * Update file details
   * @param  {AppTypeFileUpdate} params
   * @returns Promise
   */
  async updateFileDetail(
    params: AppTypeFileUpdate,
    options: { ctx: FoxCtx },
  ): Promise<Record<string, number>> {
    const fileDetail = await this.getDetailById(params.id);
    if (!fileDetail || fileDetail.deleted) {
      return { code: 1 }; // Invalid file id
    }

    // Check if the file name already exists
    if (params.name && fileDetail.name !== params.name) {
      const fileExist = await Service.file.check.checkFileNameExist(
        params.id,
        Object.assign(
          { name: fileDetail.name },
          _.pick(params, ['applicationId', 'folderId', 'name', 'type', 'suffix']),
        ) as FileCheck,
      );
      if (fileExist) {
        return { code: 2 }; // New file name already exists
      }
    }

    // Check if pathname is duplicate
    if (fileDetail.type === TYPE.PAGE) {
      const pathnameExist = await Service.file.check.pathNameExist({
        applicationId: params.applicationId,
        tags: params.tags || [],
        fileId: params.id,
      });
      if (pathnameExist) {
        return { code: 3 }; // pathname already exists
      }

      // Record file update log
      if (params.tags && params.tags !== fileDetail.tags) {
        options.ctx.operations.push(
          ...Service.log.addLogItem(LOG.FILE_TAG, fileDetail, { fileId: fileDetail.id }),
        );
      }
    }

    // Update file
    options.ctx.transactions.push(
      Model.file.updateDetailQuery(params.id, _.pick(params, ['name', 'intro', 'type', 'tags'])),
    );

    // Update content name
    if ([TYPE.VARIABLE, TYPE.CONDITION].indexOf(fileDetail.type) !== -1) {
      const contentList = await Service.content.file.getContentByFileIds([fileDetail.id]);
      contentList[0] && Service.content.info.updateDetailQuery(contentList[0].id, { title: params.name });
    }

    // Save logs
    options.ctx.operations.push(
      ...Service.log.addLogItem(LOG.FILE_UPDATE, fileDetail, { dataType: fileDetail.type }),
    );

    return { code: 0 };
  }

  /**
   * Update the specified data directly
   * @param  {string} id
   * @param  {Partial<Content>} params
   * @returns void
   */
  updateFileItem(id: string, params: Partial<File>, options: { ctx: FoxCtx }): void {
    options.ctx.transactions.push(Model.file.updateDetailQuery(id, params));
    options.ctx.operations.push(
      ...Service.log.addLogItem(LOG.FILE_UPDATE, Object.assign({ id }, params), { fileId: params.id }),
    );
  }

  /**
   * Update the deletion status of the file. When deleting,
   * you need to check whether there is any content being referenced.
   * When you enable it, you don’t need to check
   * @param  {TypeStatus} params
   * @returns Promise
   */
  async setFileDeleteStatus(params: TypeStatus, options: { ctx: FoxCtx }): Promise<Record<string, number>> {
    const fileDetail = await this.getDetailById(params.id);
    if (!fileDetail) {
      return { code: 1 }; // Invalid file information
    }

    // Get all content and version under the file
    const contentVersion = await Service.content.list.getContentAndVersionListByFileIds([params.id]);
    // Check if there is information that content is referenced under file
    const relations = await Service.relation.getContentRelationalByIds(
      params.id,
      _.map(contentVersion.contentList, 'id'),
    );

    if (relations.length > 0) {
      return { code: 2 }; // There is referenced relation information
    }

    // Set file enable state, set file, delete state of content and version
    options.ctx.transactions.push(
      this.setDeleteStatus(params.id, params.status),
      Service.content.info.batchUpdateDetailQuery({ fileId: params.id }, { deleted: true }),
      Service.version.info.setDeleteStatus(_.map(contentVersion.versionList, 'id'), true),
    );

    // Save logs
    options.ctx.operations.push(
      ...Service.log.addLogItem(LOG.FILE_REMOVE, [fileDetail], { dataType: fileDetail.type }),
      ...Service.log.addLogItem(LOG.CONTENT_REMOVE, contentVersion?.contentList || [], {
        dataType: fileDetail.type,
      }),
    );

    return { code: 0 };
  }

  /**
   * Set the delete status of specified files in batches,
   * @param  {File[]} fileList
   * @returns void
   */
  batchSetFileDeleteStatus(fileList: File[], options: { ctx: FoxCtx; status?: boolean }): void {
    const status = options.status === false ? false : true;
    options.ctx.transactions.push(this.setDeleteStatus(_.map(fileList, 'id'), status));
    options.ctx.operations.push(...Service.log.addLogItem(LOG.FILE_REMOVE, fileList || []));
  }

  /**
   * Obtain file information by file name
   * @param  {FileNameSearch} params
   * @returns {File[]} Promise
   */
  async getFileIdByNames(params: FileNameSearch): Promise<File[]> {
    return Model.file.getDetailByNames(params);
  }

  /**
   * Get file information by name
   * @param  {FilePathSearch} params
   * @param  {boolean=false} createNew
   * @returns Promise
   */
  async getFileDetailByNames(
    params: FilePathSearch,
    options: { ctx: FoxCtx; createNew?: boolean },
  ): Promise<Partial<File>> {
    const createNew = options?.createNew || false;
    params.pathList = _.pull(params.pathList, '');
    let folderId = params.parentFolderId;
    let fileDetail: Partial<File> = {};

    if (params.pathList && params.pathList.length > 0) {
      folderId = await Service.folder.info.getFolderIdByPathRecursive(
        {
          applicationId: params.applicationId,
          parentFolderId: folderId,
          pathList: params.pathList,
        },
        options,
      );
    }

    if (folderId) {
      fileDetail = await this.getDetail({
        applicationId: params.applicationId,
        folderId: folderId,
        name: params.fileName,
      });
    }

    if ((_.isEmpty(fileDetail) || fileDetail.deleted) && createNew) {
      fileDetail = this.create(
        {
          applicationId: params.applicationId,
          name: params.fileName,
          folderId: folderId,
          type: TYPE.PAGE as FileTypes,
        },
        { ctx: options.ctx },
      );
    }

    return fileDetail;
  }

  /**
   * Create file content and content version information
   * return fileId,contentId,versionId
   * @param  {File} params
   * @returns Promise
   */
  createFileContentVersion(params: File, options: FileContentVersion): Record<string, string> {
    // Create page content information
    const contentId = generationId(PRE.CONTENT);
    const contentDetail: Content = {
      id: contentId,
      title: params.name || '',
      liveVersionNumber: 0,
      tags: [],
      fileId: params.id,
      creator: params.creator || '',
    };

    // Added default version information
    const contentVersionId = generationId(PRE.CONTENT_VERSION);
    const contentVersionDetail: ContentVersion = {
      id: contentVersionId,
      contentId: contentId,
      version: options.hasVersion ? '0.0.1' : '',
      versionNumber: options.hasVersion ? 1 : 0,
      creator: params.creator || '',
      content: options.content || {},
    };

    this.create(params, { ctx: options.ctx });
    Service.content.info.create(contentDetail, { ctx: options.ctx });
    Service.version.info.create(contentVersionDetail, { ctx: options.ctx });

    // TODO Save logs

    return { fileId: params.id, contentId, contentVersionId };
  }

  /**
   * Recursively get the file id in the hierarchical file directory
   * @param  {{folders:FolderChildren[];files:File[]}} params
   * @returns string
   */
  getFileIdFromResourceRecursive(params: { folders: FolderChildren[]; files: File[] }): string[] {
    const { folders = [], files = [] } = params;
    let fileIds = _.map(files, 'id');
    folders.forEach((folder) => {
      if (folder.children) {
        fileIds.concat(this.getFileIdFromResourceRecursive(folder.children));
      }
    });

    return fileIds;
  }

  /**
   * Recursively put content details into the corresponding file
   * @param  {FileFolderContentChildren} params
   * @param  {Record<string} contentObject
   * @param  {Record<string} versionObject
   * @returns FileFolderContentChildren
   */
  addContentToFileRecursive(
    params: FileFolderContentChildren,
    contentObject: Record<string, Content>,
    versionObject: Record<string, ContentVersion>,
  ): FileFolderContentChildren {
    if (params.files?.length > 0) {
      params.files.forEach((file) => {
        file.contentId = contentObject[file.id] ? contentObject[file.id].id : '';
        file.content = contentObject[file.id] ? versionObject[contentObject[file.id].id].content : {};
      });
    }

    if (params.folders?.length > 0) {
      params.folders.forEach((folder) => {
        if (folder?.children?.files?.length > 0) {
          folder.children = this.addContentToFileRecursive(folder.children, contentObject, versionObject);
        }
      });
    }

    return params;
  }

  /**
   * Get file details through pathName
   * @param  {string} applicationId
   * @param  {string} pathName
   * @returns Promise
   */
  async getFileDetailByPathname(applicationId: string, pathName: string): Promise<Partial<File>> {
    // Get files that match the pathname tag
    let fileDetail: File | undefined;
    const fileList = await Service.file.list.find({
      applicationId: applicationId,
      tags: { $elemMatch: { pathname: pathName } },
      deleted: false,
    });

    fileDetail = fileList.find((file) => {
      return (
        file.tags?.findIndex((tag) => {
          if (tag.pathname && tag.pathname === pathName && (_.isNil(tag.status) || tag.status)) {
            return true;
          }
        }) !== -1
      );
    });

    return fileDetail || {};
  }

  /**
   * Copy files
   * Get all the contents of the source file, or the contents of the live version
   * Copy the details of each content to the content of the new page
   * If there are dependencies in the content that already exist in the relations,
   *  use the relation information directly
   *
   * setLive: set the first version to live after clone from store
   * @param  {string} sourceFileId
   * @param  {string} options?
   * @returns Promise
   */
  async copyFile(
    sourceFileId: string,
    targetApplicationId: string,
    options: {
      ctx: FoxCtx;
      folderId: string; // ID of the folder to which the file belongs
      hasLive: boolean; // Whether to copy only the content of the live version
      type?: string; // store | build, store: copy file from store, build: copy file in build page
      targetFileId?: string;
      relations?: Record<string, Record<string, string>>;
      setLive?: boolean;
    },
  ): Promise<Record<string, Record<string, string>>> {
    if (!options.relations) {
      options.relations = {};
    }

    !options.folderId && (options.folderId = '');
    !options.type && (options.type = CONT_STORE);
    options.hasLive === undefined && (options.hasLive = true);

    // Get a list of source file contents
    let [fileDetail, contentList] = await Promise.all([
      this.getDetailById(sourceFileId),
      Service.content.list.find({ fileId: sourceFileId }),
    ]);

    if (options.hasLive) {
      contentList = contentList.filter((content) => content.liveVersionNumber > 0);
    }

    if (contentList.length === 0) {
      return options.relations;
    }

    // Get the version details of all content
    const contentVersionList = await Service.version.live.getContentAndRelationVersion(
      _.map(contentList, 'id'),
    );

    let relationsContentIds: string[] = [];
    let contentDSLObject: Record<string, DSL> = {};
    contentVersionList.forEach((content) => {
      contentDSLObject[content.content?.id] = content.content;
      if (content.relations) {
        const contentRelations = _.flatten(_.toArray(content.relations));
        contentDSLObject = _.merge(contentDSLObject, _.keyBy(contentRelations, 'id'));
        relationsContentIds.push(..._.map(contentRelations, 'id'));
      }
    });

    const [relationsFileObject, relationContentList] = await Promise.all([
      Service.file.list.getContentFileByIds(relationsContentIds),
      Service.content.list.getDetailByIds(relationsContentIds),
    ]);

    const fileList = _.toArray(relationsFileObject);
    contentList = contentList.concat(relationContentList);
    fileList.unshift(fileDetail);

    // Create a new file, and file associated data file
    for (const file of fileList) {
      if (!options.relations[file.id]) {
        // Remove some tags in file tags
        file.tags = this.removeTags(file.tags || [], [TAG.CLONE, TAG.COPY]);
        const newFileDetail = Service.file.info.create(
          {
            applicationId: targetApplicationId,
            name: options.type === CONT_STORE ? file.name : [file.name, randStr(4)].join('_'),
            intro: file.intro,
            suffix: file.suffix,
            tags: file.tags?.concat({ [options.type === CONT_STORE ? TAG.COPY : TAG.CLONE]: file.id }),
            type: file.type,
            folderId: options.folderId || '',
          },
          { ctx: options.ctx },
        );
        options.relations[file.id] = { newId: newFileDetail.id };
      }
    }

    // Pre-match content Id
    let tempRelations: Record<string, Record<string, string>> = {};
    for (const content of contentList) {
      !options.relations[content.id] &&
        (tempRelations[content.id] = {
          newId: generationId(PRE.CONTENT_VERSION),
          oldName: content.title,
          newName: [content.title, randStr(4)].join('_'),
        });
    }

    // Create file content
    for (const content of contentList) {
      options.relations = Service.content.info.copyContent(content, contentDSLObject[content.id], {
        ctx: options.ctx,
        relations: options.relations,
        tempRelations: {},
        setLive: options.setLive || false,
      });
    }

    return options.relations;
  }

  /**
   * @param  {any[]} tagList
   * @param  {string[]} tagIndexes
   * @returns any
   */
  removeTags(tagList: any[], tagIndexes: string[]): any[] {
    tagList.forEach((tag, index) => {
      tag = _.omit(tag, tagIndexes);

      if (_.isEmpty(tag)) {
        delete tagList[index];
      }
    });

    return tagList;
  }
}
