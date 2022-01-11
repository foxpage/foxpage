import _ from 'lodash';

import { ContentVersion, DSL, DslRelation, DslSchemas } from '@foxpage/foxpage-server-types';

import { PRE, TYPE } from '../../../config/constant';
import * as Model from '../../models';
import { ContentVersionNumber, ContentVersionString, VersionCheckResult } from '../../types/content-types';
import { generationId } from '../../utils/tools';
import { VersionServiceAbstract } from '../abstracts/version-service-abstract';
import * as Service from '../index';

export class VersionCheckService extends VersionServiceAbstract {
  private static _instance: VersionCheckService;

  constructor() {
    super();
  }

  /**
   * Single instance
   * @returns VersionCheckService
   */
  public static getInstance(): VersionCheckService {
    this._instance || (this._instance = new VersionCheckService());
    return this._instance;
  }

  /**
   * Check the required fields in version content
   * The required fields for page, template, variable, condition, function are: ['schemas','relation']
   * The required fields for package are ['resource','meta','schema']
   * @param  {string} fileId
   * @param  {any} content
   * @returns {string[]} Promise
   */
  async contentFields(fileId: string, content: any): Promise<string[]> {
    let missingFields: string[] = [];

    // Get the type of page
    const fileDetail = await Service.file.info.getDetailById(fileId);

    if (
      [TYPE.PAGE, TYPE.TEMPLATE, TYPE.VARIABLE, TYPE.CONDITION, TYPE.FUNCTION].indexOf(fileDetail.type) !== -1
    ) {
      for (const field of ['schemas', 'relation']) {
        !content[field] && missingFields.push(field);
      }
    } else if ([TYPE.COMPONENT, TYPE.LIBRARY].indexOf(fileDetail.type) !== -1) {
      for (const field of ['resource', 'meta', 'schema']) {
        !content[field] && missingFields.push(field);
      }
    }

    return missingFields;
  }

  /**
   * Filter out non-existent content version number information
   * @param  {ContentVersionNumber[]} idNumbers
   * @param  {ContentVersion[]} contentVersion
   * @returns ContentVersionNumber
   */
  notExistVersionNumber(
    idNumbers: ContentVersionNumber[],
    contentVersion: ContentVersion[],
  ): ContentVersionNumber[] {
    let notExistContent: ContentVersionNumber[] = [];
    if (idNumbers.length > 0) {
      const contentObject = _.keyBy(contentVersion, (version) =>
        [version.contentId, version.versionNumber].join('_'),
      );

      notExistContent = idNumbers.filter(
        (item) => !contentObject[[item.contentId, item.versionNumber].join('_')],
      );
    }

    return notExistContent;
  }

  /**
   * Filter out content version information that does not exist
   * @param  {ContentVersionString[]} idVersions
   * @param  {ContentVersion[]} contentVersion
   * @returns ContentVersionString
   */
  notExistVersion(
    idVersions: ContentVersionString[],
    contentVersion: ContentVersion[],
  ): ContentVersionString[] {
    let notExistVersion: ContentVersionString[] = [];
    if (idVersions.length > 0) {
      const contentObject = _.keyBy(contentVersion, (version) =>
        [version.contentId, version.version].join('_'),
      );
      notExistVersion = idVersions.filter((item) => !contentObject[[item.contentId, item.version].join('_')]);
    }

    return notExistVersion;
  }

  /**
   * Check whether the specified version number is a new version
   * (that is, the version does not exist in the database)
   * @param  {string} contentId
   * @param  {number} versionNumber
   * @returns {boolean} Promise
   */
  async isNewVersion(contentId: string, versionNumber: number): Promise<boolean> {
    const versionDetail = await Model.version.getDetailByVersionNumber(contentId, versionNumber);

    return !versionDetail;
  }

  /**
   * Verify that the specified version number exists
   * @param  {string} contentId
   * @param  {ContentCheck} params
   * @returns Promise
   */
  async versionExist(contentId: string, version: string, versionId: string = ''): Promise<boolean> {
    return this.checkExist({ contentId, version, deleted: false }, versionId);
  }

  /**
   * Check the structure of the page:
   * 1, the structure in schemas must has `props` field, if it does not exist, the default is empty object
   * 2, the structure in schemas must has `id`, `name` fields
   * 3, parentId in structure can be removed
   * 4, contentId must be type of content `cont_xxxxx`
   * 5, structure of relation value must be {id: '', type: ''}, default is empty object
   * @param  {VersionCheckResult} versionDSL
   * @returns versionDSL
   */
  structure(versionDSL: DSL): VersionCheckResult {
    if (!versionDSL.id || !_.startsWith(versionDSL.id, PRE.CONTENT)) {
      return { code: 1, data: versionDSL, msg: versionDSL.id || '' };
    }

    if (!versionDSL.relation) {
      versionDSL.relation = {};
    } else if (!_.isEmpty(versionDSL.relation)) {
      const invalidKeys: string[] = this.relation(versionDSL.relation);
      if (invalidKeys.length > 0) {
        return { code: 2, data: versionDSL, msg: invalidKeys.join(',') };
      }
    }

    const checkResult = this.schemaCheckRecursive(versionDSL.schemas);
    if ((checkResult.options?.invalidNames || []).length > 0) {
      return { code: 3, data: versionDSL, msg: checkResult.options.invalidNames.join(',') };
    }

    return { code: 0, data: versionDSL };
  }

  /**
   * Check content relation
   * key do not has `.`
   * id is start with `cont_`
   * type must exist
   * @param  {Record<string} relation
   * @param  {} DslRelation>
   * @returns string
   */
  relation(relation: Record<string, DslRelation>): string[] {
    let invalidKeys: string[] = [];
    for (const key in relation) {
      if (
        key.indexOf('.') !== -1 ||
        !relation[key].type ||
        !relation[key].id ||
        !_.startsWith(relation[key].id, PRE.CONTENT)
      ) {
        invalidKeys.push(key);
      }
    }
    return invalidKeys;
  }

  /**
   * Check schema structure
   * 1, the structure in schemas must has `props` field, if it does not exist, the default is empty object
   * 2, the structure in schemas must has `id`, `name` fields
   * 3, parentId in structure can be removed
   * @param  {DslSchemas[]} schemas
   * @param  {{invalidNames:string[]}={invalidNames:[]}} options
   * @returns string
   */
  schemaCheckRecursive(
    schemas: DslSchemas[],
    options: { invalidNames: string[] } = { invalidNames: [] },
  ): { schemas: DslSchemas[]; options: { invalidNames: string[] } } {
    for (const structure of schemas) {
      // TODO await portal processing
      // delete structure.parentId;

      !structure.id && (structure.id = generationId(PRE.STRUCTURE));
      !structure.props && (structure.props = {});
      // TODO schema root node is virtual structure, does not has label and name field
      structure.label && !structure.name && options.invalidNames.push(structure.label);

      if (structure.children && structure.children.length > 0) {
        this.schemaCheckRecursive(structure.children, options);
      }
    }

    return { schemas, options };
  }
}
