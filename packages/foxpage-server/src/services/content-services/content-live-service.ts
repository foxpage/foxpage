import _ from 'lodash';
import { FoxCtx } from 'src/types/index-types';

import { Content, ContentVersion } from '@foxpage/foxpage-server-types';

import { LOG, TYPE, VERSION } from '../../../config/constant';
import * as Model from '../../models';
import { AppTypeContent, ContentVersionNumber, LiveContentVersion } from '../../types/content-types';
import { BaseService } from '../base-service';
import * as Service from '../index';

export class ContentLiveService extends BaseService<Content> {
  private static _instance: ContentLiveService;

  constructor() {
    super(Model.content);
  }

  /**
   * Single instance
   * @returns ContentLiveService
   */
  public static getInstance(): ContentLiveService {
    this._instance || (this._instance = new ContentLiveService());
    return this._instance;
  }

  /**
   * Get the live version information of content through contentIds
   * @param  {string[]} contentIds
   * @returns Promise
   */
  async getContentLiveIdByIds(contentIds: string[]): Promise<ContentVersionNumber[]> {
    const contentLiveNumbers = await Model.content.getLiveNumberByIds(contentIds);
    return contentLiveNumbers.map((item) => {
      return { contentId: item.id, versionNumber: item.liveVersionNumber };
    });
  }

  /**
   * Get the live version details of the specified type of content under the specified application
   * @param  {AppTypeContent} params
   * @returns {ContentVersion[]} Promise
   */
  async getContentLiveDetails(params: AppTypeContent): Promise<ContentVersion[]> {
    const contentIds = params.contentIds || [];
    if (contentIds.length === 0) {
      return [];
    }

    const contentList = await this.getDetailByIds(contentIds);
    const contentLiveIds = _.map(
      _.filter(contentList, (content) => content.liveVersionId),
      'liveVersionId',
    );

    // Get live details
    return Service.version.list.getVersionListChunk(contentLiveIds);
  }

  /**
   * Set the live version of the content, you need to check whether the version is in the release state,
   * and it cannot be set to live if it is not.
   * @param  {LiveContentVersion} params
   * @returns Promise
   */
  async setLiveVersion(
    params: LiveContentVersion,
    options: { ctx: FoxCtx; force?: boolean; actionType?: string },
  ): Promise<Record<string, number | string>> {
    const versionDetail = await Service.version.info.getDetail({
      contentId: params.id,
      versionNumber: params.versionNumber,
    });

    if (this.notValid(versionDetail)) {
      return { code: 1 }; // Invalid version information
    }

    if (!options.force && versionDetail.status !== VERSION.STATUS_RELEASE) {
      return { code: 2 }; // Not in release state
    }

    // Verify content details
    const [result, contentDetail, validateResult] = await Promise.all([
      Service.version.relation.getVersionRelationAndComponents(params.applicationId, versionDetail.content),
      Service.content.info.getDetailById(versionDetail.contentId),
      Service.version.check.versionCanPublish(versionDetail.id),
    ]);

    if (result.code === 0 && validateResult.publishStatus) {
      this.setLiveContent(versionDetail.contentId, versionDetail.versionNumber, versionDetail.id, {
        ctx: options.ctx,
        content: contentDetail,
        actionType: options.actionType,
      });
      return { code: 0 };
    } else if (validateResult.publishStatus) {
      return { code: 4, data: JSON.stringify(validateResult) };
    } else {
      return { code: 3, data: JSON.stringify(result) };
    }
  }

  /**
   * Set the live version of the content
   * @param  {string} contentId
   * @param  {number} versionNumber
   * @param  {Content} contentDetail
   * @returns void
   */
  setLiveContent(
    contentId: string,
    versionNumber: number,
    versionId: string,
    options: { ctx: FoxCtx; content?: Content; actionType?: string },
  ): void {
    options.ctx.transactions.push(
      this.updateDetailQuery(contentId, { liveVersionNumber: versionNumber, liveVersionId: versionId }),
    );
    options.ctx.operations.push(
      ...Service.log.addLogItem(LOG.LIVE, options.content || ({} as Content), {
        actionType: options.actionType || [LOG.LIVE, TYPE.CONTENT].join('_'),
        category: {
          type: TYPE.CONTENT,
          fileId: options.content?.fileId as string,
          contentId,
          versionId,
        },
      }),
    );
  }

  /**
   * Set the live version number of multiple content
   * @param  {Record<string} contentIdNumber
   * @param  {} number>
   * @returns void
   */
  bulkSetContentLiveVersion(contentIdNumber: Record<string, number>): void {
    Object.keys(contentIdNumber).forEach((contentId) => {
      this.updateDetailQuery(contentId, { liveVersionNumber: contentIdNumber[contentId] });
    });
  }
}
