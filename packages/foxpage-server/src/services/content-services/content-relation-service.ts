import _ from 'lodash';

import { Content, DSL, DslRelation } from '@foxpage/foxpage-server-types';

import { TYPE } from '../../../config/constant';
import * as Model from '../../models';
import { ContentVersionNumber, ContentVersionString, RelationsRecursive } from '../../types/content-types';
import { FoxCtx } from '../../types/index-types';
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
    if (isBuild) {
      versionNumbers = await Service.version.list.getContentLiveOrBuildVersion(
        contentIds.concat(templateIds),
      );
    } else {
      let contentVersionNumbers = [];
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

  async createNewRelations(
    relation: Record<string, any>,
    options: {
      ctx: FoxCtx;
      applicationId: string;
      projectId: string;
      scope: string;
      idMaps?: Record<string, any>;
      appDefaultIds?: string[];
    },
  ): Promise<{ idMaps: Record<string, any> }> {
    !options.idMaps && (options.idMaps = {});

    // get app default folder ids
    if (!options.appDefaultIds || options.appDefaultIds.length === 0) {
      options.appDefaultIds = await Service.folder.info.getAppDefaultItemFolderIds(options.applicationId);
    }

    // get the relation need create
    const needCreateRelationObject = await this.getNeedCreateRelationIds(
      relation,
      Object.assign(options, { appDefaultIds: options.appDefaultIds }),
    );
    const needCreateRelationIds = _.keys(needCreateRelationObject);

    if (needCreateRelationIds.length > 0) {
      const [relationLiveVersions, relationMaxVersions] = await Promise.all([
        Service.version.list.getLiveVersionByContentIds(needCreateRelationIds),
        Service.version.list.getContentMaxVersionDetail(needCreateRelationIds),
      ]);
      const relationDetailObject = Object.assign(relationMaxVersions, relationLiveVersions);

      for (const contentId in relationDetailObject) {
        const dependRelation = relationDetailObject[contentId].content?.relation || {};
        if (!_.isEmpty(dependRelation)) {
          const childRelation = await this.createNewRelations(dependRelation, options);
          options.idMaps = childRelation.idMaps;
        }

        const newRelations = Service.version.info.createCopyVersion(
          relationDetailObject[contentId].content,
          options.idMaps,
        );
        const fileInfo = Service.file.info.create(
          {
            applicationId: options.applicationId,
            folderId: options.projectId,
            name: newRelations.idNameMaps[contentId].newName,
            type: needCreateRelationObject[contentId].type,
            subType: needCreateRelationObject[contentId].subType || '',
          },
          { ctx: options.ctx },
        );
        const contentInfo = Service.content.info.create(
          {
            title: newRelations.idNameMaps[contentId].newName,
            fileId: fileInfo.id,
            applicationId: options.applicationId,
            type: needCreateRelationObject[contentId].type,
          },
          { ctx: options.ctx },
        );
        // update variable, condition and function name in version schames
        if (
          [TYPE.VARIABLE, TYPE.CONDITION, TYPE.FUNCTION].indexOf(needCreateRelationObject[contentId].type) !==
            -1 &&
          newRelations.newVersion.schemas?.[0]
        ) {
          newRelations.newVersion.schemas[0].name = newRelations.idNameMaps[contentId].newName;
        }

        Service.version.info.create(
          {
            contentId: contentInfo.id,
            content: Object.assign({}, newRelations.newVersion, { id: contentInfo.id }),
          },
          { ctx: options.ctx },
        );

        options.idMaps[contentId] = {
          id: contentInfo.id,
          name: needCreateRelationObject[contentId].name,
          newName: newRelations.idNameMaps[contentId].newName,
        };
      }
    }

    return { idMaps: options.idMaps };
  }

  /**
   * check the relation in content whether to create new data according scope
   * if scope is project, do not create
   * if scope is application, create the relation in project
   * if scope is system, create all relation
   * @param content
   * @param options
   * @returns
   */
  async getNeedCreateRelationIds(
    relation: Record<string, any>,
    options: { applicationId: string; scope: string; appDefaultIds: string[] },
  ): Promise<Record<string, any>> {
    // if (options.scope === TYPE.PROJECT) {
    //   return {};
    // }

    const relationIds = _.uniq(
      _.map(
        _.filter(_.toArray(relation), (relation) => relation.type !== TYPE.TEMPLATE),
        'id',
      ),
    );

    let needCreateRelationObject: Record<string, any> = {};
    if (relationIds.length > 0) {
      const contentFileObject = await Service.file.list.getContentFileByIds(relationIds);
      for (const contentId in contentFileObject) {
        // create new relation detail in diff project or time show condition
        if (
          (options.scope === TYPE.APPLICATION &&
            options.appDefaultIds.indexOf(contentFileObject[contentId].folderId) === -1) ||
          (options.scope === TYPE.PROJECT &&
            ['timeDisplay', 'showHide'].indexOf(contentFileObject[contentId].subType as string) !== -1)
        ) {
          needCreateRelationObject[contentId] = {
            id: contentId,
            name: contentFileObject[contentId].name,
            type: contentFileObject[contentId].type,
            subType: contentFileObject[contentId].subType || '',
          };
        }
      }
    }

    return needCreateRelationObject;
  }
}
