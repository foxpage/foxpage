import _ from 'lodash';

import { Content } from '@foxpage/foxpage-server-types';

import * as Model from '../../models';
import { CircleDepend, ContentCheck } from '../../types/content-types';
import { BaseService } from '../base-service';

export class ContentCheckService extends BaseService<Content> {
  private static _instance: ContentCheckService;

  constructor() {
    super(Model.content);
  }

  /**
   * Single instance
   * @returns ContentCheckService
   */
  public static getInstance(): ContentCheckService {
    this._instance || (this._instance = new ContentCheckService());
    return this._instance;
  }

  /**
   * Verify whether the content under the specified conditions exists.
   * If the id of the result is consistent with the contentId, it does not exist, otherwise it exists
   * @param  {string} contentId
   * @param  {ContentCheck} params
   * @returns Promise
   */
  async nameExist(contentId: string, params: ContentCheck): Promise<boolean> {
    const newContentParams: ContentCheck = _.pick(params, ['fileId', 'title']);
    return this.checkExist(Object.assign({ deleted: false }, newContentParams), contentId);
  }

  /**
   * Check for circular dependencies
   * @param  {Record<string} sourceObject
   * @param  {} string[]>
   * @param  {Record<string} dependenceObject
   * @param  {} string[]>
   * @returns CircleDepend
   */
  checkCircularDependence(
    sourceObject: Record<string, string[]>,
    dependenceObject: Record<string, string[]>,
  ): CircleDepend {
    let recursiveItem: string = '';
    for (const dependence of Object.keys(dependenceObject)) {
      if (sourceObject[dependence]) {
        sourceObject[dependence].push(...dependenceObject[dependence]);

        for (const dependenceItem of dependenceObject[dependence]) {
          if (sourceObject[dependenceItem] && sourceObject[dependenceItem].indexOf(dependence) !== -1) {
            // Cyclic dependency
            recursiveItem = dependence;
            sourceObject[dependenceItem].push(dependence);
            break;
          }
        }
      } else {
        sourceObject[dependence] = dependenceObject[dependence];
      }

      if (recursiveItem) {
        break;
      }
    }
    // Rely on de-duplication
    Object.keys(sourceObject).forEach(
      (sourceKey) => (sourceObject[sourceKey] = _.uniq(sourceObject[sourceKey])),
    );

    return { recursiveItem, dependencies: sourceObject };
  }
}
