import _ from 'lodash';

import { Content, ContentVersion, DSL, File, FileTypes, Folder } from '@foxpage/foxpage-server-types';

import { LOG, PRE, TYPE } from '../../../config/constant';
import * as Model from '../../models';
import { FolderFileContent, UpdateTypeContent } from '../../types/content-types';
import { FoxCtx, TypeStatus } from '../../types/index-types';
import { AppResource } from '../../types/validates/app-validate-types';
import { generationId, randStr } from '../../utils/tools';
import { BaseService } from '../base-service';
import * as Service from '../index';

export class ContentInfoService extends BaseService<Content> {
  private static _instance: ContentInfoService;

  constructor() {
    super(Model.content);
  }

  /**
   * Single instance
   * @returns ContentInfoService
   */
  public static getInstance(): ContentInfoService {
    this._instance || (this._instance = new ContentInfoService());
    return this._instance;
  }

  /**
   * New content details, only query statements required by the transaction are generated,
   * and details of the created content are returned
   * @param  {Partial<Content>} params
   * @returns Content
   */
  create(params: Partial<Content>, options: { ctx: FoxCtx; actionDataType?: string }): Content {
    const contentDetail: Content = {
      id: params.id || generationId(PRE.CONTENT),
      title: _.trim(params?.title) || '',
      fileId: params.fileId || '',
      applicationId: params.applicationId || '',
      type: params.type || '',
      tags: params?.tags || [],
      liveVersionNumber: params.liveVersionNumber || 0,
      liveVersionId: params.liveVersionId || '',
      creator: params?.creator || options.ctx.userInfo.id,
    };

    options.ctx.transactions.push(Model.content.addDetailQuery(contentDetail));
    Service.userLog.addLogItem(
      { id: contentDetail.id },
      {
        ctx: options.ctx,
        actions: [LOG.CREATE, options.actionDataType || params.type || '', TYPE.CONTENT],
        category: {
          applicationId: params.applicationId,
          fileId: params.fileId,
          contentId: contentDetail.id,
        },
      },
    );

    return contentDetail;
  }

  /**
   * Create content details, if it is not component content, create version information by default
   * @param  {Partial<Content>} params
   * @param  {FileTypes} type
   * @param  {any} content?
   * @returns Content
   */
  addContentDetail(
    params: Partial<Content>,
    options: {
      ctx: FoxCtx;
      type: FileTypes;
      content?: Record<string, any>;
      actionDataType?: string;
    },
  ): Content {
    const contentDetail = this.create(params, _.pick(options, ['ctx', 'actionDataType']));
    if ([TYPE.COMPONENT, TYPE.EDITOR, TYPE.LIBRARY].indexOf(options.type) === -1) {
      if (!options.content) {
        options.content = {};
      }

      options.content.id = contentDetail.id;
      Service.version.info.create(
        { contentId: contentDetail.id, content: options?.content || {} },
        { ctx: options.ctx, fileId: params.fileId, ignoreUserLog: true },
      );
    }

    return contentDetail;
  }

  /**
   * Update content details
   * @param  {UpdateTypeContent} params
   * @returns Promise
   */
  async updateContentDetail(
    params: UpdateTypeContent,
    options: { ctx: FoxCtx; actionDataType?: string; actionType?: string },
  ): Promise<Record<string, number>> {
    const contentDetail = await this.getDetailById(params.id);
    if (this.notValid(contentDetail)) {
      return { code: 1 }; // Invalid content ID
    }

    const fileDetail = await Service.file.info.getDetailById(contentDetail.fileId);
    if (this.notValid(fileDetail) || fileDetail.type !== params.type) {
      return { code: 2 }; // Check whether the file type is consistent with the specified type
    }

    if (params.title && contentDetail.title !== params.title) {
      const contentExist = await Service.content.check.nameExist(contentDetail.id, {
        fileId: contentDetail.fileId,
        title: params.title,
      });

      if (contentExist) {
        return { code: 3 }; // Duplicate content name
      }
    }

    // Update content information
    options.ctx.transactions.push(
      Model.content.updateDetailQuery(params.id, _.pick(params, ['title', 'tags'])),
    );

    // tag update log
    if (contentDetail.liveVersionNumber > 0 && params.tags !== contentDetail.tags) {
      options.ctx.operations.push(
        ...Service.log.addLogItem(LOG.CONTENT_TAG, [contentDetail], {
          actionType: options.actionType || [LOG.CONTENT_TAG, TYPE.CONTENT].join('_'),
          category: {
            type: TYPE.CONTENT,
            contentId: contentDetail.id,
            fileId: contentDetail.fileId,
            folderId: fileDetail.folderId,
            applicationId: fileDetail.applicationId,
          },
        }),
      );
    } else {
      Service.userLog.addLogItem(contentDetail, {
        ctx: options.ctx,
        actions: [LOG.UPDATE, options.actionDataType || contentDetail.type || '', TYPE.CONTENT],
        category: {
          contentId: contentDetail.id,
          fileId: contentDetail.id,
          folderId: fileDetail.folderId,
          applicationId: fileDetail.applicationId,
        },
      });
    }

    return { code: 0 };
  }

  /**
   * Update the specified data directly
   * @param  {string} id
   * @param  {Partial<Content>} params
   * @returns void
   */
  updateContentItem(
    id: string,
    params: Partial<Content>,
    options: { ctx: FoxCtx; actionDataType?: string },
  ): void {
    options.ctx.transactions.push(Model.content.updateDetailQuery(id, params));
    Service.userLog.addLogItem(
      { id: id },
      {
        ctx: options.ctx,
        actions: [LOG.UPDATE, options.actionDataType || '', TYPE.CONTENT],
        category: {
          contentId: id,
        },
      },
    );
  }

  /**
   * Set the specified content to be deleted
   * @param  {string} contentId
   * @returns Promise
   */
  async setContentDeleteStatus(
    params: TypeStatus,
    options: { ctx: FoxCtx; actionType?: string },
  ): Promise<Record<string, number>> {
    // Get content details
    const contentDetail = await this.getDetailById(params.id);
    if (this.notValid(contentDetail)) {
      return { code: 1 }; // Invalid content information
    }

    // If there is a live version, you need to check whether it is referenced by other content
    if (params.status && contentDetail.liveVersionNumber) {
      const relations = await Service.relation.getContentRelationalByIds(contentDetail.fileId, [params.id]);
      if (relations.length > 0) {
        return { code: 2 }; // There is referenced relation information
      }
    }

    const versionList = await Service.version.list.getVersionByContentIds([params.id]);

    // Set the enabled status, or update the status directly if there is no live version
    options.ctx.transactions.push(this.setDeleteStatus(params.id, params.status));
    options.ctx.transactions.push(
      Service.version.info.batchUpdateDetailQuery({ contentId: params.id }, { deleted: true }),
    );

    // Save logs
    options.ctx.operations.push(
      ...Service.log.addLogItem(LOG.CONTENT_REMOVE, [contentDetail], {
        actionType: options.actionType || [LOG.DELETE, TYPE.CONTENT].join('_'),
        category: { type: TYPE.CONTENT, contentId: params.id, fileId: contentDetail?.fileId },
      }),
      ...Service.log.addLogItem(LOG.VERSION_REMOVE, versionList, {
        actionType: options.actionType || [LOG.DELETE, TYPE.VERSION].join('_'),
        category: { type: TYPE.VERSION, contentId: params.id, fileId: contentDetail?.fileId },
      }),
    );

    return { code: 0 };
  }

  /**
   * Set the delete status of the specified content in batches,
   * @param  {Content[]} contentList
   * @returns void
   */
  batchSetContentDeleteStatus(
    contentList: Content[],
    options: { ctx: FoxCtx; status?: boolean; actionType?: string },
  ): void {
    const status = !(options.status === false);
    options.ctx.transactions.push(this.setDeleteStatus(_.map(contentList, 'id'), status));
    options.ctx.operations.push(
      ...Service.log.addLogItem(LOG.CONTENT_REMOVE, contentList, {
        actionType: options.actionType || [LOG.DELETE, TYPE.CONTENT].join('_'),
        category: { type: TYPE.CONTENT },
      }),
    );
  }

  /**
   * Get the resource type from all the parents of content, and get the corresponding application resource details
   * @param  {AppResource[]} appResource
   * @param  {Record<string} contentParentObject
   * @param  {} FolderFileContent[]>
   * @returns Record
   */
  getContentResourceTypeInfo(
    appResource: AppResource[],
    contentParentObject: Record<string, FolderFileContent[]>,
  ): Record<string, AppResource> {
    const appResourceObject = _.keyBy(appResource, 'id');
    let contentResource: Record<string, AppResource> = {};
    for (const contentId in contentParentObject) {
      for (const folder of contentParentObject[contentId]) {
        folder.tags &&
          folder.tags.forEach((tag) => {
            if (tag.resourceId) {
              contentResource[contentId] = appResourceObject[tag.resourceId] || {};
            }
          });
        if (contentResource[contentId]) {
          break;
        }
      }
    }

    return contentResource;
  }

  /**
   * Copy content from specified content information
   * At the same time copy the version information from the specified content version information
   * @param  {Content} sourceContentInfo
   * @param  {DSL} sourceContentVersion
   * @param  {{relations:Record<string} options
   * @param  {Record<string} string>;tempRelations
   * @param  {} string>}
   * @returns Record
   */
  copyContent(
    sourceContentInfo: Content,
    sourceContentVersion: DSL,
    options: {
      ctx: FoxCtx;
      relations: Record<string, Record<string, string>>;
      tempRelations: Record<string, Record<string, string>>;
      setLive?: boolean;
      idMaps?: Record<string, string>;
    },
  ): Record<string, any> {
    // Create new content page information
    const contentId =
      options.relations[sourceContentInfo.id]?.newId ||
      options.tempRelations[sourceContentInfo.id]?.newId ||
      generationId(PRE.CONTENT);

    options.relations[sourceContentInfo.id] = {
      newId: contentId,
      oldName: sourceContentInfo.title,
      newName:
        options.tempRelations[sourceContentInfo.id]?.title || [sourceContentInfo.title, randStr(4)].join('_'),
    };

    // extendId
    const extendTag = Service.content.tag.getTagsByKeys(sourceContentInfo.tags, ['extendId']);

    if (extendTag.extendId) {
      if (!options.relations[extendTag.extendId]) {
        options.relations[extendTag.extendId] = { newId: generationId(PRE.CONTENT) };
      }
      sourceContentInfo.tags = sourceContentInfo.tags.filter((tag) => {
        return !tag.extendId;
      });
      sourceContentInfo.tags.push({ extendId: options.relations[extendTag.extendId]?.newId });
    }

    Service.content.info.create(
      {
        id: contentId,
        title: options.relations[sourceContentInfo.id].newName,
        fileId: options.relations[sourceContentInfo.fileId].newId || '',
        tags: (sourceContentInfo.tags || []).concat({ copyFrom: sourceContentVersion.id }),
        liveVersionNumber: options.setLive ? 1 : 0, // default set the first version to live while copy from store
      },
      { ctx: options.ctx },
    );

    // Create new content version information
    const relationsAndIdMaps = Service.version.info.copyContentVersion(
      sourceContentVersion,
      contentId,
      Object.assign({ create: true }, options),
    );

    return { relations: relationsAndIdMaps.relations, idMaps: relationsAndIdMaps.idMaps };
  }

  /**
   * get content extension from detail,eg extendId, mockId
   * @param contentDetail
   * @returns
   */
  getContentExtension(contentDetail: Content, extensionName: string[] = ['extendId']) {
    return Service.content.tag.getTagsByKeys(contentDetail?.tags || [], extensionName);
  }

  /**
   * Get the content all level info, include app, folder, file, content and version
   * @param params
   * @returns
   */
  async getContentLevelInfo(params: { id: string; versionNumber?: number }): Promise<{
    contentInfo: Content;
    versionInfo: Partial<ContentVersion>;
    fileInfo: File;
    folderInfo: Folder;
    applicationInfo: Record<string, string>;
  }> {
    const contentInfo = await this.getDetailById(params.id);
    const fileInfo = await Service.file.info.getDetailById(contentInfo.fileId);
    const folderInfo = await Service.folder.info.getDetailById(fileInfo.folderId);
    const applicationInfo = { id: folderInfo.applicationId };

    let versionInfo: Partial<ContentVersion> = {};
    if (!params.versionNumber || !contentInfo.liveVersionNumber) {
      versionInfo = await Service.version.info.getMaxContentVersionDetail(contentInfo.id);
    } else {
      versionInfo = await Service.version.info.getContentVersionDetail({
        contentId: contentInfo.id,
        versionNumber: params.versionNumber || contentInfo.liveVersionNumber,
      });
    }

    return { contentInfo, fileInfo, folderInfo, applicationInfo, versionInfo };
  }
}
