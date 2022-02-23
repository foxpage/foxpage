import _ from 'lodash';

import { Content, DSL, DslRelation } from '@foxpage/foxpage-server-types';

import { TYPE } from '../../../config/constant';
import * as Model from '../../models';
import { ContentVersionNumber, ContentVersionString, RelationsRecursive } from '../../types/content-types';
import { BaseService } from '../base-service';
import * as Service from '../index';

export class ContentRelationService extends BaseService<Content> {
  private static _instance: ContentRelationService;

  constructor() {
    super(Model.content);
  }

  /**
   * Single instance
   * @returns ContentRelationService
   */
  public static getInstance(): ContentRelationService {
    this._instance || (this._instance = new ContentRelationService());
    return this._instance;
  }

  /**
   * Recursively get the relations details,
   * Check if the dependency exists,
   * Check if there is a circular dependency
   *
   * The version of the template data in the relation should be the live version,
   * and the other content has a version, which is the specified version,
   * and if not, the latest version is used
   * @param  {DslRelation} relations
   *  @param {isBuild: boolean} = false, return the details of the build, including the relation
   * @returns Promise
   */
  async getRelationDetailRecursive(
    relations: Record<string, DslRelation>,
    relayChain: Record<string, string[]> = {},
    isBuild: boolean = false,
  ): Promise<RelationsRecursive> {
    if (_.isEmpty(relations)) {
      return { relationList: [], dependence: {}, recursiveItem: '', missingRelations: [] };
    }

    // Get the id and version information in the relation
    const contentItemVersion = this.getTypeContentIdVersionFromRelation(_.toArray(relations));
    const templateIds = contentItemVersion.templateIds;
    const contentIds = contentItemVersion.otherTypeIds;
    const contentIdsWithVersion = contentItemVersion.itemVersions;

    // Get the live version of relation by ID
    let versionNumbers: ContentVersionNumber[] = [];
    let contentVersionNumbers = [];
    if (isBuild) {
      contentVersionNumbers = await Service.version.list.getContentLiveOrBuildVersion(
        contentIds.concat(templateIds),
      );
    } else {
      [versionNumbers, contentVersionNumbers] = await Promise.all([
        Service.content.live.getContentLiveIdByIds(templateIds),
        Service.version.number.getContentMaxVersionByIds(contentIds),
      ]);

      contentVersionNumbers.forEach((content) =>
        versionNumbers.push({ contentId: content._id, versionNumber: content.versionNumber }),
      );
    }

    // Get details through contentId and versionNumber, get details through contentId and version
    const contentVersionList = await Promise.all([
      Service.version.list.getContentByIdAndVersionNumber(versionNumbers),
      Service.version.list.getContentByIdAndVersionString(contentIdsWithVersion),
    ]);

    // Get the dependency information in the dependency and check whether the relationship exists
    let missingRelations: string[] = [];
    let contentDetails = _.flatten(contentVersionList);
    const idNumberNotExist = Service.version.check.notExistVersionNumber(versionNumbers, contentDetails);
    const idVersionNotExist = Service.version.check.notExistVersion(contentIdsWithVersion, contentDetails);
    if (idNumberNotExist.length > 0 || idVersionNotExist.length > 0) {
      missingRelations = _.map(idNumberNotExist, 'contentId').concat(_.map(idVersionNotExist, 'contentId'));
    }

    let childrenRelations: Record<string, DslRelation> = {};
    contentDetails.forEach((content) => _.merge(childrenRelations, (content.content as DSL).relation || {}));

    // Check for circular dependencies
    const relationObject = Service.version.relation.getRelationsFromVersion(contentDetails);
    const contentRelation = Service.content.check.checkCircularDependence(relayChain, relationObject);

    if (
      contentRelation &&
      contentRelation.recursiveItem === '' &&
      !_.isEmpty(contentRelation.dependencies) &&
      !_.isEmpty(childrenRelations)
    ) {
      const relationDetails: RelationsRecursive = await this.getRelationDetailRecursive(
        childrenRelations,
        contentRelation.dependencies,
        isBuild,
      );
      contentDetails = contentDetails.concat(relationDetails.relationList);
      contentRelation.recursiveItem = relationDetails.recursiveItem;
      missingRelations.concat(relationDetails.missingRelations);
    }

    return {
      relationList: contentDetails,
      dependence: relationObject,
      recursiveItem: contentRelation.recursiveItem,
      missingRelations,
    };
  }

  /**
   * Get template content id, other types of content id,
   * and content id containing version from relation
   * @param  {any[]} itemList
   * @param  {string='id'} idKey
   * @returns any
   */
  getTypeContentIdVersionFromRelation(itemList: any[], idKey: string = 'id'): any {
    let templateIds: string[] = [];
    let otherTypeIds: string[] = [];
    let itemVersions: ContentVersionString[] = [];

    itemList.forEach((item) => {
      if (item.type && item.type === TYPE.TEMPLATE) {
        templateIds.push(item[idKey]);
      } else if (item.version) {
        itemVersions.push(item);
      } else {
        otherTypeIds.push(item[idKey]);
      }
    });

    return { templateIds, otherTypeIds, itemVersions };
  }
}
