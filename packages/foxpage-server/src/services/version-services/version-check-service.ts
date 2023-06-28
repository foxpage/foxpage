import _ from 'lodash';

import { ContentVersion, DSL, DslRelation, DslSchemas } from '@foxpage/foxpage-server-types';

import { PRE, TYPE } from '../../../config/constant';
import * as Model from '../../models';
import { ContentVersionNumber, ContentVersionString, VersionCheckResult } from '../../types/content-types';
import { generationId } from '../../utils/tools';
import { BaseService } from '../base-service';
import * as Service from '../index';

export class VersionCheckService extends BaseService<ContentVersion> {
  private static _instance: VersionCheckService;

  constructor() {
    super(Model.version);
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
        !content?.[field] && missingFields.push(field);
      }
    } else if ([TYPE.COMPONENT, TYPE.LIBRARY].indexOf(fileDetail.type) !== -1) {
      for (const field of ['resource', 'meta', 'schema']) {
        !content?.[field] && missingFields.push(field);
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
  structure(versionDSL: DSL, options?: { notCheckName: boolean }): VersionCheckResult {
    if (!versionDSL.id || !_.startsWith(versionDSL.id, PRE.CONTENT)) {
      return { code: 1, data: [versionDSL.id] };
    }

    if (!versionDSL.relation) {
      versionDSL.relation = {};
    } else if (!_.isEmpty(versionDSL.relation)) {
      const invalidKeys: string[] = this.relation(versionDSL.relation);
      if (invalidKeys.length > 0) {
        return { code: 2, data: invalidKeys };
      }
    }

    const notCheckName = options?.notCheckName || false;
    if (!notCheckName) {
      const checkResult = this.schemaCheckRecursive(versionDSL?.schemas || []);
      if ((checkResult?.invalidNames || []).length > 0) {
        return { code: 3, data: checkResult.invalidNames };
      }
    }

    return { code: 0, data: [] };
  }

  /**
   * Check content relation
   * key do not has `.`
   * id is start with `cont_`
   * type must exist
   * @param  {Record<string, DslRelation>} relation
   * @returns string
   */
  relation(relation: Record<string, DslRelation>): string[] {
    let invalidKeys: string[] = [];
    for (const key in relation) {
      // do not check system variable, conditions ..
      const ignoreCheck = Service.relation.ignoreCheckRelation(key, relation[key]);
      if (ignoreCheck) {
        continue;
      }

      if (!relation[key].type || !relation[key].id || !_.startsWith(relation[key].id, PRE.CONTENT)) {
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
   * 4, the component is invalid when deprecated or deleted
   *
   * invalidRelationNames is the relation data in schema that not found in content.relation object
   * @param  {DslSchemas[]} schemas
   * @param  {{invalidNames:string[]}={invalidNames:[]}} options
   * @returns string
   */
  schemaCheckRecursive(
    schemas: DslSchemas[] = [],
    options?: { invalidRelationNames: string[] },
  ): {
    invalidNames: Record<string, string>[];
    invalidRelationNameData: Record<string, string>[];
  } {
    let invalidNames: Record<string, string>[] = [];
    let invalidRelationNameData: Record<string, string>[] = [];
    let invalidRelationNames = options?.invalidRelationNames || [];

    for (const structure of schemas) {
      !structure.id && (structure.id = generationId(PRE.STRUCTURE));
      !structure.props && (structure.props = {});
      structure.label && !structure.name && invalidNames.push({ id: structure.id, label: structure.label });

      // get the structure id of invalid schema relation
      if (invalidRelationNames.length > 0) {
        const schemaItemString = JSON.stringify(_.omit(structure, ['children']));
        const relationMatches: string[] = schemaItemString.match(/(?<=\{\{)(.+?)(?=\}\})/g) || [];
        const intersectionNames = _.intersection(relationMatches, invalidRelationNames);
        if (intersectionNames.length > 0) {
          intersectionNames.map((item) => {
            invalidRelationNameData.push({ id: structure.id, name: item });
          });
          _.pullAll(invalidRelationNames, intersectionNames);
        }
      }

      if (structure.children && structure.children.length > 0) {
        const childResult = this.schemaCheckRecursive(structure.children, { invalidRelationNames });
        invalidNames = invalidNames.concat(childResult.invalidNames);
        invalidRelationNameData = invalidRelationNameData.concat(childResult.invalidRelationNameData);
      }
    }

    return { invalidNames, invalidRelationNameData };
  }

  /**
   * check relation data in schemas list, and mapping with relation data in content
   * response the relation in schemas not mapping in relation in content
   * @param content
   * @returns
   */
  schemaRelationMapping(content: DSL): string[] {
    let invalidSchemaRelation: string[] = [];
    const schemasString = JSON.stringify(content.schemas || []);
    const relationMatches: string[] = schemasString.match(/(?<=\{\{)(.+?)(?=\}\})/g) || [];

    for (const schemaRelation of _.uniq(relationMatches)) {
      if (_.startsWith(schemaRelation, '$this:') || _.startsWith(schemaRelation, '__context:')) {
        continue;
      }

      if (!content.relation[schemaRelation]) {
        invalidSchemaRelation.push(schemaRelation);
      }
    }

    return invalidSchemaRelation;
  }

  /**
   * check content version can be publish
   * 1, schema structure
   * 2, content relation data
   * 3, structure relation mapping
   * 4, content extend id, version id, content id
   * @param versionId
   * @returns
   */
  async versionCanPublish(versionId: string): Promise<Record<string, any>> {
    let responseObject: Record<string, any> = {
      publishStatus: true,
      versionId: '',
      contentId: '',
      extendId: '',
      structure: [],
      relation: {},
    };

    const versionDetail = await Service.version.info.getDetailById(versionId);
    if (this.notValid(versionDetail)) {
      responseObject.versionId = versionId;
      return responseObject;
    }

    const contentDetail = await Service.content.info.getDetailById(versionDetail.contentId);
    if (this.notValid(contentDetail)) {
      responseObject.contentId = versionDetail.contentId;
      return responseObject;
    }

    const extension = Service.content.tag.getTagsByKeys(contentDetail?.tags || [], ['extendId']);
    const componentItems = Service.content.component.getComponentInfoRecursive(
      versionDetail.content.schemas || [],
    );
    const schemaMapResult = this.schemaRelationMapping(versionDetail.content);
    const { invalidNames, invalidRelationNameData } = this.schemaCheckRecursive(
      versionDetail.content.schemas,
      {
        invalidRelationNames: schemaMapResult,
      },
    );

    const [invalidComponents, relationResult, extendDetail] = await Promise.all([
      Service.component.checkComponentStatus(contentDetail.applicationId, componentItems),
      Service.relation.checkRelationStatus(versionDetail.content.relation),
      Service.content.info.getDetailById(extension.extendId),
    ]);

    responseObject.extendId = extension.extendId && this.notValid(extendDetail) ? extension.extendId : '';
    responseObject.relation = relationResult;
    if (invalidNames.length > 0) {
      responseObject.structure.push({ status: 3, data: invalidNames });
    }

    if (invalidRelationNameData.length > 0) {
      responseObject.structure.push({ status: 4, data: invalidRelationNameData });
    }

    if (invalidComponents.deletedList.length > 0) {
      responseObject.structure.push({ status: 5, data: invalidComponents.deletedList });
    }

    if (invalidComponents.deprecatedList.length > 0) {
      responseObject.structure.push({ status: 6, data: invalidComponents.deprecatedList });
    }

    if (
      responseObject.versionId ||
      responseObject.contentId ||
      responseObject.extendId ||
      !_.isEmpty(responseObject.relation) ||
      responseObject.structure.length > 0
    ) {
      responseObject.publishStatus = false;
    }

    return responseObject;
  }
}
