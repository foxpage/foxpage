import _ from 'lodash';
import { FoxCtx } from 'src/types/index-types';

import { ContentRelation, ContentVersion, File } from '@foxpage/foxpage-server-types';

import { PRE } from '../../config/constant';
import * as Model from '../models';
import { ContentVersionString } from '../types/content-types';
import { generationId } from '../utils/tools';

import { RelationServiceAbstract } from './abstracts/relation-service-abstract';
import * as Service from './index';

export class RelationService extends RelationServiceAbstract {
  private static _instance: RelationService;

  constructor() {
    super();
  }

  /**
   * Single instance
   * @returns OrgService
   */
  public static getInstance(): RelationService {
    this._instance || (this._instance = new RelationService());
    return this._instance;
  }

  /**
   * Check the validity of the data in the relation, that is, it does not exist or is deleted
   * @param  {Record<string} relations
   * @param  {string}>} {id
   * @returns Promise
   */
  async checkRelationStatus(relations: Record<string, { id: string }>): Promise<Record<string, string>> {
    const contentIds = _.map(_.toArray(relations), 'id');
    const invalidContentIds: string[] = [];
    const invalidRelations: Record<string, string> = {};
    if (contentIds.length > 0) {
      const contentList = await Service.content.list.getDetailByIds(contentIds);
      const contentObject = _.keyBy(contentList, 'id');

      for (const contentId of contentIds) {
        if (
          !contentObject[contentId] ||
          // contentObject[contentId].liveVersionNumber === 0 ||
          contentObject[contentId].deleted
        ) {
          invalidContentIds.push(contentId);
        }
      }

      if (invalidContentIds.length > 0) {
        Object.keys(relations).forEach((relation) => {
          if (invalidContentIds.indexOf(relations[relation].id) !== -1) {
            invalidRelations[relation] = relations[relation].id;
          }
        });
      }
    }

    return invalidRelations;
  }

  /**
   * Get the associated data through useContentId, and check whether the referenced content is valid
   * If the referenced content is valid, and all the files in the content and the referenced content
   * are not the same file, then return to change the relation content
   * @param  {string[]} contentIds
   * @returns Promise
   */
  async getContentRelationalByIds(fileId: string, contentIds: string[]): Promise<ContentRelation[]> {
    const relations = await this.find({ 'relation.useContentId': { $in: contentIds }, deleted: false });

    // Check the validity of the cited information
    const relationList = await Service.content.info.getDetailByIds(_.map(relations, 'contentId'));
    const validRelationContentObject = _.keyBy(relationList, 'id');

    return relations.filter(
      (relation) =>
        validRelationContentObject[relation.contentId] &&
        validRelationContentObject[relation.contentId].fileId !== fileId,
    );
  }

  /**
   * Save relation information
   * @param  {string} contentId
   * @param  {number} versionNumber
   * @param  {any} relations
   * @returns Promise
   */
  async saveRelations(
    contentId: string,
    versionNumber: number,
    relations: any,
    options: { ctx: FoxCtx },
  ): Promise<void> {
    const contentRelations = Object.keys(relations).map((key) => {
      return { useContentId: <string>relations[key].id };
    });
    // Get the existing contentId, versionNumber data
    const existRelations = await this.getDetail({ contentId, versionNumber, deleted: false });
    if (existRelations) {
      Model.relation.updateDetailQuery(existRelations.id, { relation: contentRelations });
    } else {
      Model.relation.addDetailQuery({
        id: generationId(PRE.RELATION),
        contentId,
        versionNumber,
        relation: contentRelations,
        deleted: false,
        creator: options.ctx.userInfo.id,
      });
    }
  }

  /**
   * Set the structure of the returned relations to
   * the structure of {"templates": [], "variables":[],...}
   * @param  {Record<string} relationObject
   * @param  {} ContentVersion>
   * @returns Promise
   */
  async formatRelationResponse(
    relationObject: Record<string, ContentVersion>,
  ): Promise<Record<string, any[]>> {
    const relationContentIds = Object.keys(relationObject);
    let contentFileObject: Record<string, File> = {};
    if (relationContentIds.length > 0) {
      contentFileObject = await Service.file.list.getContentFileByIds(relationContentIds);
    }

    let relations: Record<string, any> = {};
    Object.keys(contentFileObject).forEach((contentId) => {
      const type = contentFileObject[contentId].type + 's';
      const relationDetail = relationObject[contentId] || {};
      !relations[type] && (relations[type] = []);
      relations[type].push(
        Object.assign({ version: relationDetail?.version || '' }, relationDetail?.content || {}),
      );
    });

    return relations;
  }

  /**
   * Set the structure of relations to the structure of {"templates": [], "variables":[],...}
   * @param  {any[]} versionItemRelations
   * @returns Promise
   */
  async formatRelationDetailResponse(versionItemRelations: any[]): Promise<Record<string, ContentVersion[]>> {
    const contentFileObject = await Service.file.list.getContentFileByIds(_.map(versionItemRelations, 'id'));

    let itemRelations: Record<string, any[]> = {};
    const itemVersionRelations = _.keyBy(versionItemRelations, 'id');
    Object.keys(contentFileObject).forEach((contentId) => {
      if (!itemRelations[contentFileObject[contentId].type + 's']) {
        itemRelations[contentFileObject[contentId].type + 's'] = [];
      }
      itemRelations[contentFileObject[contentId].type + 's'].push(itemVersionRelations[contentId]);
    });

    return itemRelations;
  }

  /**
   * Recursively get the relation details,
   * and check the validity of the relation information at the same time
   * @param  {string[]} ids
   * @param  {ContentVersionString[]} idVersions
   * @returns Promise
   */
  async getAllRelationsByIds(ids: string[], idVersions: ContentVersionString[]): Promise<ContentVersion[]> {
    if (ids.length === 0 && idVersions.length === 0) {
      return [];
    }

    if (ids.length > 0) {
      const maxVersions = await Service.version.number.getContentMaxVersionByIds(ids);
      maxVersions.forEach((version) =>
        idVersions.push({
          contentId: version._id,
          version: Service.version.number.getVersionFromNumber(version.versionNumber),
        }),
      );
    }

    let versionList: ContentVersion[] = [];
    if (idVersions.length > 0) {
      versionList = await Service.version.list.getContentInfoByIdAndVersion(idVersions);
      const invalidIdVersions = this.getInvalidRelationIdVersion(idVersions, versionList);
      const subIdVersions = this.getRelationIdsFromVersion(versionList);
      const subRelationList = await this.getAllRelationsByIds(subIdVersions.ids, subIdVersions.idVersions);

      if (subRelationList.length > 0) {
        versionList = versionList.concat(subRelationList);
      }
      // Return invalid relation information
      versionList = versionList.concat(invalidIdVersions as ContentVersion[]);
    }

    return versionList;
  }

  /**
   * Get the id and version information of the relation from the version details
   * @param  {ContentVersion[]} versionList
   * @param  {string[]=[]} ignoreType
   * @returns ContentVersionString
   */
  getRelationIdsFromVersion(
    versionList: ContentVersion[],
    ignoreType: string[] = [],
  ): { ids: string[]; idVersions: ContentVersionString[] } {
    let relationIds: string[] = [];
    let relationVersionIds: ContentVersionString[] = [];
    versionList.forEach((version) => {
      const relationList = _.toArray(version?.content?.relation || {});
      for (const relation of relationList) {
        if (!relation.id || ignoreType.indexOf(relation.type) !== -1) {
          continue;
        }

        if (relation.version) {
          relationVersionIds.push({ contentId: relation.id, version: relation.version });
        } else {
          relationIds.push(relation.id);
        }
      }
    });

    return { ids: relationIds, idVersions: relationVersionIds };
  }

  /**
   * Check whether the queried relation details exist, and return non-existent relation information
   * @param  {ContentVersionString[]} idVersions
   * @param  {ContentVersion[]} versionList
   * @returns ContentVersionString
   */
  getInvalidRelationIdVersion(
    idVersions: ContentVersionString[],
    versionList: ContentVersion[],
  ): ContentVersionString[] {
    let invalidRelations: ContentVersionString[] = [];
    const versionObject = _.keyBy(versionList, (version) => [version.contentId, version.version].join('_'));
    idVersions.forEach((version) => {
      if (!versionObject[[version.contentId, version.version].join('_')]) {
        invalidRelations.push(version);
      }
    });
    return invalidRelations;
  }
}
