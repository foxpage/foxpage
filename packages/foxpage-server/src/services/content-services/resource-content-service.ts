import _ from 'lodash';

import { Content } from '@foxpage/foxpage-server-types';

import * as Model from '../../models';
import { TRecord } from '../../types/index-types';
import { BaseService } from '../base-service';
import * as Service from '../index';

export class ResourceContentService extends BaseService<Content> {
  private static _instance: ResourceContentService;

  constructor() {
    super(Model.content);
  }

  /**
   * Single instance
   * @returns ResourceContentService
   */
  public static getInstance(): ResourceContentService {
    this._instance || (this._instance = new ResourceContentService());
    return this._instance;
  }

  /**
   * Get resource details through resource contentId,
   * Return content information with contentId as the key
   * @param  {string[]} contentIds
   * @returns Promise
   */
  async getResourceContentByIds(contentIds: string[]): Promise<TRecord<TRecord<string>>> {
    const contentDetailList = await Promise.all(
      _.chunk(contentIds, 100).map((ids) =>
        Service.version.info.find({ contentId: { $in: ids || [] }, deleted: false }, 'contentId content'),
      ),
    );
    let contentObject: TRecord<TRecord<string>> = {};
    _.flatten(contentDetailList).forEach((content) => {
      contentObject[content.contentId] = content.content;
    });

    return contentObject;
  }
}
