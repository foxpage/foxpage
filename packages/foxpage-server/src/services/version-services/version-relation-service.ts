import _ from 'lodash';

import { ContentVersion, DSL, File } from '@foxpage/foxpage-server-types';

import * as Model from '../../models';
import { NameVersion, RelationAssocContent, RelationsRecursive } from '../../types/content-types';
import { BaseService } from '../base-service';
import * as Service from '../index';

export class VersionRelationService extends BaseService<ContentVersion> {
  private static _instance: VersionRelationService;

  constructor() {
    super(Model.version);
  }

  /**
   * Single instance
   * @returns VersionRelationService
   */
  public static getInstance(): VersionRelationService {
    this._instance || (this._instance = new VersionRelationService());
    return this._instance;
  }

  /**
   * Get the relation information in the version
   * @param  {ContentVersion[]} contentVersionList
   * @returns Record
   */
  getRelationsFromVersion(contentVersionList: ContentVersion[]): Record<string, string[]> {
    let relationObject: Record<string, string[]> = {};

    contentVersionList.forEach((version) => {
      if (!relationObject[version.contentId]) {
        relationObject[version.contentId] = [];
      }

      if (version.content.relation) {
        _.merge(relationObject[version.contentId], _.map(Object.values(version.content.relation), 'id'));
      }
    });

    return relationObject;
  }

  /**
   * Get all components recursively
   * Get all dependencies
   * Find if the component has a version available
   * Find out if there is an available version of the dependency
   * @param  {string} applicationId
   * @param  {any} versionContent
   * @returns Promise
   */
  async getVersionRelationAndComponents(
    applicationId: string,
    versionContent: any,
  ): Promise<Record<string, number | string | NameVersion[]>> {
    const componentInfos = Service.content.component.getComponentInfoRecursive(versionContent.schemas);

    const [components, relations] = await Promise.all([
      Service.content.component.getComponentDetailRecursive(applicationId, componentInfos) as Promise<any>,
      Service.content.relation.getRelationDetailRecursive({}) as Promise<any>,
    ]);

    // Check the validity of components
    if (components.missingComponents.length > 0) {
      return { code: 1, data: components.missingComponents };
    }

    // Cyclic dependency
    if (components.recursiveItem) {
      return { code: 2, data: components.recursiveItem };
    }

    // Check the validity of components
    if (relations.missingRelations.length > 0) {
      return { code: 3, data: relations.missingRelations };
    }

    // Cyclic dependency
    if (relations.recursiveItem) {
      return { code: 4, data: relations.recursiveItem };
    }

    return { code: 0 };
  }

  /**
   * Return content corresponding to content, file information,
   * version information through contentIds in relations
   * @param  {string[]} relationIds
   * @returns RelationAssocContent
   */
  async getRelationDetail(
    relationObject: Record<string, any>,
    buildVersion: boolean = false,
  ): Promise<Record<string, RelationAssocContent>> {
    let contentRelation: Record<string, RelationAssocContent> = {};
    for (const contentId of Object.keys(relationObject)) {
      const allRelations = await Service.content.relation.getRelationDetailRecursive(
        relationObject[contentId],
      );

      const allRelationContentIds = _.map(allRelations.relationList, 'contentId');
      const contentList = await Service.content.info.getDetailByIds(allRelationContentIds);
      let versionIds: string[] = [];

      // get all relation build version, if not exist, get live version
      if (buildVersion) {
        const buildList = await Service.version.list.getContentMaxVersionDetail(allRelationContentIds);
        versionIds = _.map(_.toArray(buildList), 'id');
      } else {
        versionIds = _.pull(_.map(contentList, 'liveVersionId') as string[], '');
      }

      const [fileList, versionList] = await Promise.all([
        Service.file.info.getDetailByIds(_.map(contentList, 'fileId')),
        Service.version.list.getDetailByIds(versionIds),
      ]);
      contentRelation[contentId] = { files: fileList, contents: contentList, versions: versionList };
    }

    return contentRelation;
  }

  /**
   * Group relations by file type
   * Return {templates:[],variables:[],conditions:[],functions:[],...}
   * @param  {RelationsRecursive} relationRecursive
   * @returns Promise
   */
  async getTypesRelationVersions(relationRecursive: RelationsRecursive): Promise<Record<string, DSL[]>> {
    const contentIds = _.map(relationRecursive.relationList, 'contentId');
    const contentList = await Service.content.info.getDetailByIds(contentIds);

    const fileIds = _.map(contentList, 'fileId');
    const fileList = await Service.file.info.getDetailByIds(fileIds);
    const fileObject: Record<string, File> = _.keyBy(fileList, 'id');

    const contentFileTypes: Record<string, any> = _.keyBy(
      contentList.map((content) => {
        return { id: content.id, type: fileObject[content.fileId]?.type + 's' || '' };
      }),
      'id',
    );

    const relations: Record<string, DSL[]> = {};
    relationRecursive.relationList.forEach((relation: ContentVersion) => {
      if (contentFileTypes[relation.contentId]) {
        if (!relations[contentFileTypes[relation.contentId].type]) {
          relations[contentFileTypes[relation.contentId].type] = [];
        }
        relations[contentFileTypes[relation.contentId].type].push(relation.content as DSL);
      }
    });

    return relations;
  }

  /**
   * Through the version object information, recursively obtain the relation details in the version,
   * append it to the relation, and return the version object information
   * @param  {Record<string} versionObject
   * @param  {} ContentVersion>
   * @param  {boolean=true} liveVersion Whether to get the version information of live
   * @returns Promise
   */
  async getVersionRelations(
    versionObject: Record<string, ContentVersion>,
    liveVersion: boolean = true,
  ): Promise<Record<string, ContentVersion>> {
    let relationContentIds: string[] = [];
    let versionObjectClone = _.cloneDeep(versionObject);
    let relationVersionObject: Record<string, ContentVersion> = {};

    Object.keys(versionObjectClone).forEach((version) => {
      const relationList = _.toArray(versionObjectClone[version]?.content?.relation || {});
      relationContentIds = relationContentIds.concat(_.map(relationList, 'id'));
    });

    if (relationContentIds.length > 0) {
      if (liveVersion) {
        const contentLiveIdObject = await Service.content.list.getContentLiveIds(relationContentIds);
        const relationVersionList = await Service.version.list.getVersionListChunk(
          _.values(contentLiveIdObject),
        );
        relationVersionObject = _.keyBy(relationVersionList, 'contentId');
      } else {
        relationVersionObject = await Service.version.list.getContentMaxVersionDetail(relationContentIds);
      }

      // Recursively get the relation in the relation
      const childRelationVersionObject = await this.getVersionRelations(relationVersionObject, liveVersion);
      _.merge(relationVersionObject, childRelationVersionObject);
    }

    return relationVersionObject;
  }

  /**
   * Add mock relation data to page content relations
   * @param versionRelations
   * @param mockRelations
   * @returns
   */
  moveMockRelations(versionRelations: any = {}, mockRelations: any): any {
    if (!_.isEmpty(mockRelations)) {
      for (const relationKey in mockRelations) {
        if (!versionRelations[relationKey + 's']) {
          versionRelations[relationKey + 's'] = [];
        }

        versionRelations[relationKey + 's'] = _.toArray(
          _.keyBy(_.merge(mockRelations[relationKey], versionRelations[relationKey + 's'] || []), 'id'),
        );
      }
    }

    return versionRelations;
  }
}
