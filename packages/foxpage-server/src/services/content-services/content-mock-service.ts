import _ from 'lodash';

import { ContentVersion, DSL } from '@foxpage/foxpage-server-types';

import { VERSION } from '../../../config/constant';
import { ContentLiveVersion,ContentVersionNumber } from '../../types/content-types';
// import * as Model from '../models';
import * as Service from '../index';

export class ContentMockService {
  private static _instance: ContentMockService;

  constructor() {
  }

  /**
   * Single instance
   * @returns ContentMockService
   */
  public static getInstance (): ContentMockService {
    this._instance || (this._instance = new ContentMockService());
    return this._instance;
  }

  /**
   * get content extensions, eg. extendId, mockId
   * @param contentIds 
   */
  async getContentExtension (contentIds: string[]): Promise<Record<string, any>> {
    const contentList = await Service.content.info.getDetailByIds(contentIds);

    const contentExtension: Record<string, any> = {};
    contentList.forEach(content => {
      contentExtension[content.id] = Service.content.info.getContentExtension(content, ['extendId', 'mockId']);
    });

    return contentExtension;
  };

  /**
   * get mock content build version, if not build version,  max version, get the live
   * @param contentIds 
   * @returns 
   */
  async getMockBuildVersions (contentIds: string[]): Promise<Record<string, any>> {
    if (contentIds.length === 0) {
      return {};
    }

    let mockIds: string[] = [];
    let contentMockMap: Record<string, string> = {};
    const contentExtension = await this.getContentExtension(contentIds);

    for (const contentId in contentExtension) {
      contentExtension[contentId].mockId && mockIds.push(contentExtension[contentId].mockId);
      contentMockMap[contentExtension[contentId].mockId] = contentId;
    }
    const contentVersionList = await Service.version.info.find(
      { contentId: { $in: mockIds }, deleted: false },
      'contentId versionNumber status',
      { sort: { versionNumber: 'desc' } },
    );

    let baseVersionInfoObject: Record<string, ContentVersionNumber> = {};
    contentVersionList.forEach((version) => {
      if (!baseVersionInfoObject[version.contentId] && version.status !== VERSION.STATUS_DISCARD) {
        baseVersionInfoObject[version.contentId] = _.pick(version, ['contentId', 'versionNumber']);
      }
    });

    const buildList = await Service.version.list.getContentByIdAndVersionNumber(_.toArray(baseVersionInfoObject));
    const buildObject = _.keyBy(buildList, 'contentId');
    let contentMockVersion: Record<string, any> = {};
    for (const contentId of contentIds) {
      const relations = await this.getMockRelations([buildObject[contentExtension[contentId]?.mockId]]);
      contentMockVersion[contentId] = {
        mock: buildObject[contentExtension[contentId]?.mockId]?.content || {},
        extension: contentExtension[contentId] || {},
        relations,
      };
    }

    return contentMockVersion;
  }

  /**
   * Get content mock live versions, if no live version, response empty
   * Response object {contentId: mockContentVersion}
   * @param contentIds 
   * @returns 
   */
  async getMockLiveVersions (contentIds: string[]): Promise<Record<string, any>> {
    if (contentIds.length === 0) {
      return {};
    }

    let mockIds: string[] = [];
    let contentMockMap: Record<string, string> = {};
    const contentExtension = await this.getContentExtension(contentIds);
    for (const contentId in contentExtension) {
      contentExtension[contentId].mockId && mockIds.push(contentExtension[contentId].mockId);
      contentMockMap[contentExtension[contentId].mockId] = contentId;
    }

    const mockLiveInfo: ContentLiveVersion[] = [];
    const mockContentList = await Service.content.info.getDetailByIds(mockIds);
    mockContentList.forEach(content => {
      if (content.liveVersionNumber > 0) {
        mockLiveInfo.push({ id: content.id, liveVersionNumber: content.liveVersionNumber });
      }
    });

    const liveList = await Service.version.list.getContentInfoByIdAndNumber(mockLiveInfo);
    const liveObject = _.keyBy(liveList, 'contentId');
    const mockObject: Record<string, any> = {};
    for (const contentId of contentIds) {
      const relations = await this.getMockRelations([liveObject[contentExtension[contentId]?.mockId]]);
      mockObject[contentId] = {
        mock: liveObject[contentExtension[contentId]?.mockId]?.content || {},
        extension: contentExtension[contentId] || {},
        relations
      };
    }

    return mockObject;
  }

  /**
   * Get mock relation details
   * @param versionList 
   * @returns 
   */
  async getMockRelations (versionList: ContentVersion[]): Promise<Record<string, DSL[]>> {
    versionList = _.pullAll(versionList, undefined);

    if (versionList.length === 0) {
      return {};
    }

    const relationIds = _.map(_.toArray(versionList[0]?.content?.relation || {}), 'id');
    const [relationVersions, contentFileObject] = await Promise.all([
      Service.relation.getAllRelationsByIds(relationIds, []),
      Service.file.list.getContentFileByIds(relationIds),
    ]);

    let relationObject: Record<string, DSL[]> = {};
    relationVersions.forEach(relation => {
      if (contentFileObject[relation.contentId]?.type &&
        !relationObject[contentFileObject[relation.contentId].type]) {
        relationObject[contentFileObject[relation.contentId].type] = [];
      }
      relationObject[contentFileObject[relation.contentId].type].push(relation.content);

    });
    return relationObject;
  }
}
