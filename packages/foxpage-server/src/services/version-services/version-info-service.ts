import dayjs from 'dayjs';
import _ from 'lodash';

import {
  Component,
  Content,
  ContentStatus,
  ContentVersion,
  DSL,
  DslRelation,
  DslSchemas,
} from '@foxpage/foxpage-server-types';
import { DateTime } from '@foxpage/foxpage-shared';

import { ACTION, LOG, PRE, TYPE, VERSION } from '../../../config/constant';
import * as Model from '../../models';
import { ComponentContentInfo } from '../../types/component-types';
import {
  ContentVersionNumber,
  NameVersion,
  NameVersionContent,
  SearchLatestVersion,
  UpdateContentVersion,
} from '../../types/content-types';
import { FoxCtx, TypeStatus } from '../../types/index-types';
import { generationId, randStr } from '../../utils/tools';
import { BaseService } from '../base-service';
import * as Service from '../index';

interface VersionWithTitle extends ContentVersion {
  title: string;
  versionNumber: number;
}

export class VersionInfoService extends BaseService<ContentVersion> {
  private static _instance: VersionInfoService;

  constructor() {
    super(Model.version);
  }

  /**
   * Single instance
   * @returns VersionInfoService
   */
  public static getInstance(): VersionInfoService {
    this._instance || (this._instance = new VersionInfoService());
    return this._instance;
  }

  /**
   * New version details are added, only query statements required by the transaction are generated,
   * and the details of the created version are returned
   * @param  {Partial<ContentVersion>} params
   * @param {ignoreUserLog} do not save to content log
   * @returns ContentVersion
   */
  create(
    params: Partial<ContentVersion>,
    options: {
      ctx: FoxCtx;
      fileId?: string;
      actionDataType?: string;
      ignoreUserLog?: boolean;
    },
  ): ContentVersion {
    const invalidRelations = Service.version.check.relation(params.content?.relation || {});
    if (invalidRelations.length > 0) {
      throw new Error('Invalid content relation:' + invalidRelations.join(', '));
    }

    const versionDetail: ContentVersion = {
      id: params.id || generationId(PRE.CONTENT_VERSION),
      contentId: params.contentId || '',
      version: params.version || '0.0.1',
      versionNumber: params.versionNumber || 1,
      status: <ContentStatus>(params.status || VERSION.STATUS_BASE),
      content: Object.assign({}, params.content || {}, { id: params.contentId }),
      creator: params.creator || options.ctx.userInfo.id,
    };

    options.ctx.transactions.push(Model.version.addDetailQuery(versionDetail));
    if (!options.ignoreUserLog) {
      Service.userLog.addLogItem(
        { id: versionDetail.id },
        {
          ctx: options.ctx,
          actions: [LOG.CREATE, options.actionDataType || '', TYPE.VERSION],
          category: {
            versionId: versionDetail.id,
            contentId: params.contentId,
          },
        },
      );
    }

    return versionDetail;
  }

  /**
   * Update version details, including version number
   * Get the maximum effective version data of the specified content (possibly base or other status)
   * 1, If it is base, update directly,
   * 2, If it is other status or no data, create a base and then update
   * @param  {UpdateContentVersion} params
   * @returns Promise
   */
  async updateVersionDetail(
    params: UpdateContentVersion,
    options: { ctx: FoxCtx; actionDataType?: string },
  ): Promise<Record<string, number | string | string[]>> {
    if (params.content && (<DSL>params.content).relation) {
      const invalidRelations = Service.version.check.relation((<DSL>params.content).relation || {});
      if (invalidRelations.length > 0) {
        return { code: 5, data: invalidRelations };
      }
    }

    const [contentDetail, versionDetail] = await Promise.all([
      Service.content.info.getDetailById(params.id),
      Service.version.info.getMaxContentVersionDetail(params.id, { ctx: options.ctx }),
    ]);

    // Check required fields
    if (this.notValid(contentDetail)) {
      return { code: 1 };
    }

    // Check if the version already exists
    if (params.version && (this.notValid(versionDetail) || params.version !== versionDetail.version)) {
      const versionExist = await Service.version.check.versionExist(params.id, params.version);
      if (versionExist) {
        return { code: 3 };
      }
    }

    const missingFields = await Service.version.check.contentFields(contentDetail.fileId, params.content);
    if (missingFields.length > 0) {
      return { code: 4, data: missingFields };
    }

    const contentUpdateTime = versionDetail?.contentUpdateTime || '';
    if (
      contentUpdateTime &&
      params.contentUpdateTime &&
      dayjs(params.contentUpdateTime).unix() < dayjs(contentUpdateTime).unix()
    ) {
      // version content update time not equal last update time
      return { code: 5 };
    }

    let versionId = versionDetail?.id || '';
    let version = params.version || versionDetail?.version || '0.0.1';

    // Create a new base version
    if (!versionDetail || versionDetail.status !== VERSION.STATUS_BASE) {
      const newVersionDetail = await this.createNewContentVersion(params.id, { ctx: options.ctx });
      version = newVersionDetail.version;
      versionId = newVersionDetail.id;
    }

    // Update
    params.content.id = params.id;
    (<DSL>params.content).version = '0.0.1'; // default dsl version
    options.ctx.transactions.push(
      Model.version.updateDetailQuery(versionId, {
        version: version,
        versionNumber: Service.version.number.createNumberFromVersion(version),
        content: params.content,
        contentUpdateTime: new DateTime() as any,
      }),
    );

    Service.userLog.addLogItem(versionDetail, {
      ctx: options.ctx,
      actions: [LOG.UPDATE, options.actionDataType || '', TYPE.VERSION],
      category: { contentId: params.id, versionId },
    });

    return { code: 0, data: versionId };
  }

  /**
   * Update the specified data directly
   * @param  {string} id
   * @param  {Partial<Content>} params
   * @returns void
   */
  updateVersionItem(
    id: string,
    params: Partial<ContentVersion>,
    options: { ctx: FoxCtx; actionDataType?: string },
  ): void {
    if ((<DSL>params.content).relation) {
      const invalidRelations = Service.version.check.relation((<DSL>params.content).relation || {});
      if (invalidRelations.length > 0) {
        throw new Error('Invalid content relation:' + invalidRelations.join(', '));
      }
    }

    options.ctx.transactions.push(Model.version.updateDetailQuery(id, params));
    Service.userLog.addLogItem(
      { id: id },
      {
        ctx: options.ctx,
        actions: [LOG.UPDATE, options.actionDataType || '', TYPE.VERSION],
        category: {
          versionId: id,
        },
      },
    );
  }

  /**
   * Get the maximum version information of the specified page
   * If the largest version is invalid, whether to create a new version
   * @param  {string} contentId
   * @param  {boolean=false} createNew
   * @returns Promise
   */
  async getMaxContentVersionDetail(
    contentId: string,
    options?: { ctx: FoxCtx; createNew?: boolean },
  ): Promise<ContentVersion> {
    const createNew = options?.createNew || false;
    let versionDetail = await Model.version.getMaxVersionDetailById(contentId);
    if (
      createNew &&
      (!versionDetail || versionDetail.status !== VERSION.STATUS_BASE || versionDetail.deleted)
    ) {
      versionDetail = await this.createNewContentVersion(contentId, { ctx: options?.ctx as FoxCtx });
    }

    return versionDetail || {};
  }

  /**
   * Get the latest base version details of the specified content
   * @param  {string} contentId
   * @returns Promise
   */
  async getMaxBaseContentVersionDetail(contentId: string): Promise<ContentVersion> {
    return Model.version.getMaxVersionDetailById(contentId, { status: VERSION.STATUS_BASE as ContentStatus });
  }

  /**
   * Through contentId, create a new version details
   * The new version number is determined by the latest valid version under the content
   * @param {string} contentId
   * @returns {Promise<ContentVersion>}
   * @memberof VersionService
   */
  async createNewContentVersion(contentId: string, options: { ctx: FoxCtx }): Promise<ContentVersion> {
    const newVersionDetail = await this.getContentLatestVersion({ contentId });

    // Set new version information
    newVersionDetail.id = generationId(PRE.CONTENT_VERSION);
    newVersionDetail.contentId = contentId;
    newVersionDetail.content = newVersionDetail?.content || { id: contentId };
    newVersionDetail.status = VERSION.STATUS_BASE as ContentStatus;
    newVersionDetail.version = Service.version.number.getNewVersion(newVersionDetail?.version);
    newVersionDetail.versionNumber = Service.version.number.createNumberFromVersion(
      newVersionDetail?.version,
    );
    newVersionDetail.pictures = [];
    newVersionDetail.createTime = new DateTime() as any;
    newVersionDetail.updateTime = new DateTime() as any;
    newVersionDetail.creator = options.ctx.userInfo.id;

    // Save
    options.ctx.transactions.push(Model.version.addDetailQuery(newVersionDetail));

    return _.cloneDeep(newVersionDetail);
  }

  /**
   * Set the delete status of the version.
   * If the version is live version, you need to check whether the content is referenced
   * @param  {TypeStatus} params
   * @returns Promise
   */
  async setVersionDeleteStatus(
    params: TypeStatus,
    options: { ctx: FoxCtx; actionType?: string },
  ): Promise<Record<string, number>> {
    const versionDetail = await this.getDetailById(params.id);
    if (this.notValid(versionDetail)) {
      return { code: 1 }; // Invalid version information
    }

    const contentDetail = await Service.content.info.getDetailById(versionDetail.contentId);

    if (params.status && contentDetail?.liveVersionNumber === versionDetail.versionNumber) {
      return { code: 2 }; // Can not be deleted
    }

    // Set the enabled state
    options.ctx.transactions.push(this.setDeleteStatus(params.id, params.status));
    options.ctx.operations.push(
      ...Service.log.addLogItem(LOG.VERSION_REMOVE, [versionDetail], {
        actionType: options.actionType || [LOG.DELETE, TYPE.VERSION].join('_'),
        fileId: contentDetail?.fileId,
      }),
    );

    return { code: 0 };
  }

  /**
   * Set the delete status of the specified version in batches,
   * @param  {ContentVersion[]} versionList
   * @returns void
   */
  batchSetVersionDeleteStatus(
    versionList: ContentVersion[],
    options: { ctx: FoxCtx; status?: boolean; actionType?: string },
  ): void {
    const status = !(options.status === false);
    options.ctx.transactions.push(this.setDeleteStatus(_.map(versionList, 'id'), status));
    options.ctx.operations.push(
      ...Service.log.addLogItem(LOG.VERSION_REMOVE, versionList, {
        actionType: options.actionType || [LOG.DELETE, TYPE.VERSION].join('_'),
        category: { type: TYPE.VERSION },
      }),
    );
  }

  /**
   * Get version details by file name and content version.
   * The data is the case where the file name and content name are the same,
   * and there is only one content under the file, such as components
   * @param  {string} applicationId
   * @param  {NameVersion[]} nameVersions
   * @returns Promise
   */
  async getVersionDetailByFileNameVersion(
    applicationId: string,
    type: string,
    nameVersions: NameVersion[],
  ): Promise<NameVersionContent[]> {
    const fileList = await Service.file.info.getFileIdByNames({
      applicationId,
      type,
      fileNames: _.map(nameVersions, 'name'),
    });

    const contentList = await Service.content.file.getContentByFileIds(_.map(fileList, 'id'));
    const versionList = await Service.version.number.getContentVersionByNumberOrVersion(
      nameVersions,
      contentList,
    );
    const contentObject = _.keyBy(contentList, 'id');
    const contentNameObject = _.keyBy(contentList, 'title');
    const contentVersionList = _.map(
      versionList,
      (version) =>
        Object.assign(
          {},
          version,
          _.pick(contentObject[version.contentId], ['title', 'versionNumber']),
        ) as VersionWithTitle,
    );
    const contentVersionObject = _.keyBy(contentVersionList, (item) => item.title + item.versionNumber);
    const nameLiveVersions = _.map(nameVersions, (item) =>
      Object.assign({}, item, {
        versionNumber: item.version
          ? Service.version.number.createNumberFromVersion(item.version)
          : contentNameObject[item.name]?.liveVersionNumber,
      }),
    );

    const nameVersionContent: NameVersionContent[] = nameLiveVersions.map((item) =>
      Object.assign(
        _.pick(item, ['name', 'version']),
        _.pick(contentVersionObject[item.name + item.versionNumber], ['content']),
      ),
    );

    return nameVersionContent;
  }

  /**
   * Get the latest version information of the page content
   * @param  {SearchLatestVersion} params
   * @returns {ContentVersion} Promise
   */
  async getContentLatestVersion(params: SearchLatestVersion): Promise<ContentVersion> {
    const version = await Model.version.getLatestVersionInfo(params);
    return (version as ContentVersion) || {};
  }

  /**
   * Get details of the specified page version or live version
   * @param  {ContentVersionNumber} params
   * @returns Promise
   */
  async getContentVersionDetail(params: ContentVersionNumber): Promise<ContentVersion> {
    const { versionNumber = 0, contentId } = params;

    let versionDetail: ContentVersion;
    if (versionNumber) {
      versionDetail = await this.getDetail(params);
    } else {
      // Get the live version information of content
      const contentDetail = await Service.content.info.getDetailById(contentId);
      versionDetail = await Service.version.number.getContentByNumber({
        contentId,
        versionNumber: contentDetail?.liveVersionNumber || 1,
      });
    }

    return versionDetail;
  }

  /**
   * Through contentList and contentVersionList information,
   * match contentId+version corresponding to the version details corresponding to different versions.
   * And contains the version details corresponding to the live version with contentId as the key.
   * Return information with content+version as the key
   * @param  {Content[]} contentList
   * @param  {ContentVersion[]} contentVersionList
   * @returns StringObject
   */
  mappingContentVersionInfo(
    contentList: Content[],
    contentVersionList: ContentVersion[],
  ): Record<string, ContentVersion> {
    const contentVersionObject: Record<string, ContentVersion> = {};
    const contentIdObject = _.keyBy(contentList, 'id');
    contentVersionList.forEach((content) => {
      contentVersionObject[content.contentId + content.version] = content;
      if (
        contentIdObject[content.contentId] &&
        contentIdObject[content.contentId].liveVersionNumber === content.versionNumber
      ) {
        contentVersionObject[content.contentId] = content;
      }
    });

    return contentVersionObject;
  }

  /**
   * Find the templateId through the version data of the page, and get the live version data of the template
   * @param  {string} applicationId
   * @param  {ContentVersion} pageVersion
   * @returns Promise
   */
  async getTemplateDetailFromPage(
    pageVersion: ContentVersion,
    options?: { isLive: boolean },
  ): Promise<Partial<ContentVersion>> {
    let templateId: string = '';
    const liveTemplateVersion = !_.isNil(options?.isLive) ? options?.isLive : true;
    const key = _.findKey(pageVersion?.content?.relation || {}, (item) => item.type === TYPE.TEMPLATE);
    templateId = key !== '' ? pageVersion?.content?.relation?.[<string>key]?.id : '';

    let templateVersion: Partial<ContentVersion> = {};
    if (templateId) {
      if (liveTemplateVersion) {
        const templateVersions = await Service.version.live.getContentLiveDetails({
          contentIds: [templateId],
        });
        templateVersion = templateVersions[0] || {};
      } else {
        const versionObject = await Service.version.list.getContentMaxVersionDetail([templateId]);
        templateVersion = versionObject[templateId] || {};
      }
    }

    return templateVersion;
  }

  /**
   * Copy version information from the specified content version
   * 1, update the structureId in the source version
   * 2, replace the relationId in the source version
   * @param  {DSL} sourceContentVersion
   * @param  {string} contentId: New content ID
   * @param  {
   *  relations:Record<string>
   *  tempRelations: Record<string, Record<string, string>>,
   *  create?: boolean
   *  versionId?: string
   * } options
   * create: true if for copy and create version, false is for copy and update version
   * versionId: when create is false, then update this version id's detail
   * @returns
   */
  copyContentVersion(
    sourceContentVersion: DSL,
    contentId: string,
    options: {
      ctx: FoxCtx;
      relations: Record<string, Record<string, string>>;
      tempRelations: Record<string, Record<string, string>>;
      create?: boolean;
      versionId?: string;
      setLive?: boolean;
      idMaps?: Record<string, string>;
    },
  ): Record<string, any> {
    const dsl = _.cloneDeep(sourceContentVersion);
    dsl.id = contentId;
    // Process the structureId value in schemes and replace the content id value in relation
    const dslSchemaAndIdMap = this.changeDSLStructureIdRecursive(
      sourceContentVersion.schemas,
      options.idMaps,
    );
    dsl.schemas = dslSchemaAndIdMap.schemas;
    const idMaps = dslSchemaAndIdMap.idMaps || {};

    if (dsl.relation) {
      for (const key in dsl.relation) {
        if (options.relations[dsl.relation[key].id]) {
          dsl.relation[key].id = options.relations[dsl.relation[key].id].newId;
        } else if (options.tempRelations[dsl.relation[key].id]) {
          dsl.relation[key].id = options.tempRelations[dsl.relation[key].id].newId;
          options.relations[dsl.relation[key].id] = options.tempRelations[dsl.relation[key].id];
        } else {
          // const contentId = generationId(PRE.CONTENT);
          // const contentName = key.split(':')[0] || '';
          // options.relations[dsl.relation[key].id] = {
          //   newId: contentId,
          //   oldName: contentName,
          //   newName: [contentName, randStr(4)].join('_'),
          // };
          // dsl.relation[key].id = contentId;
        }
      }
    }

    // Update relation name in schemas
    const newDSL = this.replaceVersionSchemaRelationNames(dsl.schemas, dsl.relation, options.relations);
    dsl.schemas = newDSL.schemas;
    dsl.relation = newDSL.relation;

    // Create version
    if (options.create) {
      this.create(
        {
          id: generationId(PRE.CONTENT_VERSION),
          contentId: contentId,
          version: '0.0.1',
          versionNumber: 1,
          status: <ContentStatus>(options.setLive ? VERSION.STATUS_RELEASE : VERSION.STATUS_BASE), // set the first version to release in copy
          content: dsl,
        },
        { ctx: options.ctx },
      );
    } else {
      options.ctx.transactions.push(
        Model.version.updateDetailQuery(options.versionId || '', { content: dsl }),
      );
    }

    return { relations: options.relations, idMaps };
  }

  /**
   * create new version data from source version
   * replace relation key and schema dynamic fields
   * @param sourceVersion
   * @param idNameMaps
   * @param changeName whether or not change the schema item name
   * @returns
   */
  createCopyVersion(
    sourceVersion: DSL,
    idNameMaps: Record<string, any>,
    changeName: boolean = false,
  ): { newVersion: DSL; idNameMaps: Record<string, any> } {
    // content id
    let newContentId = generationId(PRE.CONTENT);
    let relationMaps: Record<string, string> = {};
    const sourceName = sourceVersion.schemas[0]?.name || '';
    const newSourceName = sourceName + '_' + randStr();
    idNameMaps[sourceVersion.id] = {
      id: newContentId,
      name: sourceName,
      newName: newSourceName,
    };

    changeName && (sourceVersion.schemas[0].name = newSourceName);

    // replace content relation and schemas
    let relation: Record<string, any> = {};
    let schemasString = JSON.stringify(sourceVersion.schemas);
    for (const itemKey in sourceVersion.relation) {
      const relationItem = sourceVersion.relation[itemKey] || {};
      if (relationItem.type) {
        let newRelationKey = '';
        if (relationItem.type === TYPE.VARIABLE && idNameMaps[relationItem.id]) {
          newRelationKey = itemKey.replace(
            idNameMaps[relationItem.id].name || '',
            idNameMaps[relationItem.id].newName || '',
          );
          relation[newRelationKey] = { id: idNameMaps[relationItem.id].id, type: relationItem.type };
        } else if (
          [TYPE.CONDITION, TYPE.FUNCTION].indexOf(relationItem.type) !== -1 &&
          idNameMaps[relationItem.id]
        ) {
          newRelationKey = itemKey.replace(relationItem.id, idNameMaps[relationItem.id].id);
          relation[newRelationKey] = { id: idNameMaps[relationItem.id].id, type: relationItem.type };
        } else {
          relation[itemKey] = sourceVersion.relation[itemKey];
        }

        if (newRelationKey) {
          relationMaps[itemKey] = newRelationKey;
          schemasString = _.replace(
            schemasString,
            new RegExp('{{' + _.escapeRegExp(itemKey) + '}}', 'gm'),
            '{{' + newRelationKey + '}}',
          );
        }
      } else {
        relation[itemKey] = sourceVersion.relation[itemKey];
      }
    }

    const schemas = this.removeInvalidStructure(JSON.parse(schemasString));

    return {
      newVersion: { id: newContentId, relation, schemas },
      idNameMaps,
    };
  }

  /**
   * remove invalid structure node in schemas
   * eg. name: system.inherit-blank-node
   * @param schemas
   */
  removeInvalidStructure(schemas: DslSchemas[]): DslSchemas[] {
    _.remove(schemas, { name: 'system.inherit-blank-node' });
    schemas.forEach((schema) => {
      if (schema.children && schema.children.length > 0) {
        schema.children = this.removeInvalidStructure(schema.children);
      }
    });

    return schemas;
  }

  /**
   * update content schemas structure id
   * @param schemas
   * @param idMaps
   * @param options
   * @returns
   */
  updateSchemaIdRecursive(
    schemas: DslSchemas[],
    idMaps: Record<string, string> = {},
    options: { clearExtend?: boolean; parentId?: string } = {},
  ): {
    schemas: DslSchemas[];
    idMaps: Record<string, string>;
  } {
    const clearExtend = options.clearExtend || false;
    const parentId = options.parentId || '';

    for (const schema of schemas) {
      const schemaId = generationId(PRE.STRUCTURE);
      idMaps[_.clone(schema.id)] = schemaId;
      schema.id = schemaId;

      !schema.extension && (schema.extension = {});

      if (clearExtend) {
        schema.extension.parentId = parentId as string;
      } else if (schema.extension?.parentId && idMaps[schema.extension.parentId]) {
        schema.extension.parentId = idMaps[schema.extension.parentId];
      }

      if (schema.extension?.extendId && clearExtend) {
        schema.extension.extendId = undefined;
      }

      if (schema.children && schema.children.length > 0) {
        options.parentId = schemaId;
        const childrenSchemaObject = this.updateSchemaIdRecursive(schema.children, idMaps, options);
        schema.children = childrenSchemaObject.schemas || [];
        idMaps = childrenSchemaObject.idMaps || {};
      }
    }

    return { schemas, idMaps };
  }

  /**
   * Update the structureId value in the dsl schema
   * @param  {DslSchemas[]} schemas
   * @returns DslSchemas
   */
  changeDSLStructureIdRecursive(
    schemas: DslSchemas[],
    idMaps: Record<string, string> = {},
    parentId?: string,
  ): { schemas: DslSchemas[]; idMaps: Record<string, string> } {
    // TODO structure id in props need to replace too
    (schemas || []).forEach((structure) => {
      if (!idMaps[structure.id]) {
        const newStructureId = generationId(PRE.STRUCTURE);
        idMaps[structure.id] = newStructureId;
        structure.id = newStructureId;
      } else {
        structure.id = idMaps[structure.id];
      }

      if (structure.extension?.parentId) {
        if (!idMaps[structure.extension.parentId]) {
          idMaps[structure.extension.parentId] = generationId(PRE.STRUCTURE);
        }
        structure.extension.parentId = idMaps[structure.extension.parentId] || parentId;
      }

      if (structure.extension?.extendId) {
        if (!idMaps[structure.extension.extendId]) {
          idMaps[structure.extension.extendId] = generationId(PRE.STRUCTURE);
        }

        structure.extension.extendId = idMaps[structure.extension.extendId] || '';
      }

      if (structure.wrapper) {
        structure.wrapper = parentId;
      }

      if (structure.children && structure.children.length > 0) {
        this.changeDSLStructureIdRecursive(structure.children, idMaps, idMaps[structure.id]);
      }
    });

    return { schemas, idMaps };
  }

  /**
   * replace the special schemas relation name and ids
   * @param  {DslSchemas[]} schemas
   * @param  {Record<string, DslRelation>} relation
   * @param  {Record<string,Record<string,string>>} relations
   * @returns
   */
  replaceVersionSchemaRelationNames(
    schemas: DslSchemas[] = [],
    relation: Record<string, DslRelation> = {},
    relations: Record<string, Record<string, string>> = {},
  ): { schemas: DslSchemas[]; relation: Record<string, DslRelation> } {
    let schemasString = JSON.stringify(schemas);
    const relationMatches = schemasString.match(/\{\{.*?\}\}/g);
    // Replace relation in schemas
    relationMatches &&
      relationMatches.forEach((match) => {
        const matchStr = _.replace(_.replace(match, '{{', ''), '}}', '');
        const matchArr = matchStr.split(':');
        const matchRelationName = matchArr[0] || '';
        if (matchRelationName) {
          const matchReg = _.replace(match, /\$/g, '\\$');
          for (const key in relations) {
            if (
              [TYPE.TEMPLATE, TYPE.CONDITION, TYPE.FUNCTION].indexOf(relation[matchStr]?.type) !== -1 &&
              key === matchArr[1]
            ) {
              matchArr[1] = relations[key].newId;
              schemasString = _.replace(
                schemasString,
                new RegExp(matchReg, 'gm'),
                '{{' + matchArr.join(':') + '}}',
              );
              break;
            } else if (relations[key].oldName === matchRelationName) {
              matchArr[0] = relations[key].newName;
              schemasString = _.replace(
                schemasString,
                new RegExp(matchReg, 'gm'),
                '{{' + matchArr.join(':') + '}}',
              );
              break;
            }
          }
        }
      });

    // Replace key name in relation
    for (const key in relation) {
      const relationArr = key.split(':');

      for (const item in relations) {
        if (
          [TYPE.TEMPLATE, TYPE.CONDITION, TYPE.FUNCTION].indexOf(relation[key]?.type) !== -1 &&
          item === relationArr[1] &&
          relations[item]
        ) {
          relationArr[1] = relations[item].newId;
          relation[relationArr.join(':')] = relation[key];
          delete relation[key];
          break;
        } else if (relations[item].oldName === relationArr[0]) {
          relationArr[0] = relations[item].newName;
          relation[relationArr.join(':')] = relation[key];
          delete relation[key];
          break;
        }
      }
    }

    return { schemas: JSON.parse(schemasString), relation: relation || {} };
  }

  /**
   * Get the version's relation and component details
   * @param versionDetail
   * @param options
   * @returns
   */
  async getPageVersionInfo(
    versionDetail: ContentVersion,
    options: { applicationId: string; isLive?: boolean },
  ): Promise<Record<string, any>> {
    const versionSchemas = versionDetail?.content?.schemas || [];
    let componentDetailList: Component[] = [];
    let mockObject: Record<string, any> = [];
    [mockObject, componentDetailList] = await Promise.all([
      !options.isLive
        ? Service.content.mock.getMockBuildVersions([versionDetail.contentId as string])
        : Service.content.mock.getMockLiveVersions([versionDetail.contentId as string]),
      Service.content.component.getComponentsFromDSL(options.applicationId, versionSchemas),
    ]);

    let componentList = _.flatten(componentDetailList);

    const editorComponentList = await Service.content.component.getEditorDetailFromComponent(
      options.applicationId,
      componentList,
    );
    componentList = componentList.concat(editorComponentList);
    const idVersionList = Service.component.getEditorAndDependenceFromComponent(componentList);
    const dependencies = await Service.component.getComponentDetailByIdVersion(idVersionList);
    componentList = componentList.concat(_.map(dependencies, (depend) => depend?.content || {}));
    const componentIds = Service.content.component.getComponentResourceIds(componentList);

    const [resourceObject, relationObject, componentFileObject, contentAllParents] = await Promise.all([
      Service.content.resource.getResourceContentByIds(componentIds),
      Service.version.relation.getVersionRelations({ [versionDetail.contentId]: versionDetail }, false),
      Service.file.list.getContentFileByIds(_.map(componentList, 'id')),
      Service.content.list.getContentAllParents(componentIds),
    ]);

    const appResource = await Service.application.getAppResourceFromContent(contentAllParents);
    const contentResource = Service.content.info.getContentResourceTypeInfo(appResource, contentAllParents);

    // Add the resource to the component, add the editor-entry and the name of the dependencies in the component
    componentList = Service.component.addNameToEditorAndDepends(
      componentList as ComponentContentInfo[],
      componentFileObject,
    );
    componentList = Service.content.component.replaceComponentResourceIdWithContent(
      componentList,
      resourceObject,
      contentResource,
    );

    const relations = await Service.relation.formatRelationResponse(relationObject);

    return { versionDetail, componentList, relations, mockObject };
  }

  /**
   * Format the props value in mock version schemas
   * when type is variable
   *  action is save, format props.value from object to string
   *  action is get, format props.value from string to object
   * @param mockSchemas
   * @param action save|get
   * @param types default is ['variable']
   * @returns
   */
  formatMockValue(mockSchemas: DslSchemas[], action: string, types?: string[]): DslSchemas[] {
    if (!types || types.length === 0) {
      types = [TYPE.VARIABLE];
    }

    if (types.indexOf(TYPE.VARIABLE) !== -1) {
      (mockSchemas || []).forEach((item) => {
        if (item.type === TYPE.VARIABLE && item?.props?.value) {
          if (action === ACTION.SAVE && _.isPlainObject(item.props.value)) {
            item.props.value = JSON.stringify(item.props.value);
          } else if (action === ACTION.GET && _.isString(item.props.value)) {
            item.props.value = JSON.parse(item.props.value);
          }
        }
      });
    }

    return mockSchemas;
  }

  /**
   * Update version schema structure info,
   * include create new structureId, remove extendId, update parentId ..
   * @param schemas
   * @param structureIdMap
   * @param options
   * @returns
   */
  updateVersionStructureId(schemas: DslSchemas[], parentId?: string): DslSchemas[] {
    if (schemas && schemas.length > 0) {
      schemas.forEach((schema) => {
        const newStructureId = generationId(PRE.STRUCTURE);
        schema.id = newStructureId;

        if (schema.extension && schema.extension.parentId) {
          schema.extension.parentId = parentId || undefined;
        }

        if (schema.extension && schema.extension.extendId) {
          schema.extension.extendId = undefined;
        }

        if (schema.children && schema.children.length > 0) {
          schema.children = this.updateVersionStructureId(schema.children, newStructureId);
        }
      });
    }

    return schemas;
  }

  /**
   * flatten schemas
   * @param schemas
   * @returns
   */
  flattenSchemas(schemas: DslSchemas[]): DslSchemas[] {
    let flattenSchemas: DslSchemas[] = [];
    (schemas || []).forEach((item) => {
      flattenSchemas.push(_.omit(item, ['children']));
      if (item.children && item.children.length > 0) {
        const childrenFlattenSchemas = this.flattenSchemas(item.children);
        flattenSchemas = flattenSchemas.concat(childrenFlattenSchemas);
      }
    });

    return flattenSchemas;
  }
}
