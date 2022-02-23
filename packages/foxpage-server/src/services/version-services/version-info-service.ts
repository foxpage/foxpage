import _ from 'lodash';

import {
  Content,
  ContentStatus,
  ContentVersion,
  DSL,
  DslRelation,
  DslSchemas,
  FileTypes,
} from '@foxpage/foxpage-server-types';

import { LOG, PRE, TYPE, VERSION } from '../../../config/constant';
import * as Model from '../../models';
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
   * @returns ContentVersion
   */
  create(params: Partial<ContentVersion>, options: { ctx: FoxCtx; fileId?: string }): ContentVersion {
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
      content: Object.assign({ id: params.contentId }, params.content || {}),
      creator: params.creator || options.ctx.userInfo.id,
    };

    options.ctx.transactions.push(Model.version.addDetailQuery(versionDetail));
    options.ctx.operations.push({
      action: LOG.CREATE,
      category: LOG.CATEGORY_APPLICATION,
      content: {
        id: versionDetail.id,
        contentId: params.contentId,
        fileId: options?.fileId,
        after: versionDetail,
      },
    });

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
    options: { ctx: FoxCtx },
  ): Promise<Record<string, number | string | string[]>> {
    if ((<DSL>params.content).relation) {
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
    if (!contentDetail) {
      return { code: 1 };
    }

    // Check if the version already exists
    if (params.version && (!versionDetail || params.version !== versionDetail.version)) {
      const versionExist = await Service.version.check.versionExist(params.id, params.version);
      if (versionExist) {
        return { code: 3 };
      }
    }

    const missingFields = await Service.version.check.contentFields(contentDetail.fileId, params.content);
    if (missingFields.length > 0) {
      return { code: 4, data: missingFields };
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
    (<DSL>params.content).version = '1.0'; // default dsl version
    console.log(params.content);
    options.ctx.transactions.push(
      Model.version.updateDetailQuery(versionId, {
        version: version,
        versionNumber: Service.version.number.createNumberFromVersion(version),
        content: params.content,
      }),
    );

    // Save logs
    options.ctx.operations.push(
      ...Service.log.addLogItem(LOG.VERSION_UPDATE, versionDetail, { fileId: contentDetail.fileId }),
    );

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
    options: { ctx: FoxCtx; fileId?: string },
  ): void {
    if ((<DSL>params.content).relation) {
      const invalidRelations = Service.version.check.relation((<DSL>params.content).relation || {});
      if (invalidRelations.length > 0) {
        throw new Error('Invalid content relation:' + invalidRelations.join(', '));
      }
    }

    options.ctx.transactions.push(Model.version.updateDetailQuery(id, params));
    options.ctx.operations.push(
      ...Service.log.addLogItem(LOG.VERSION_UPDATE, Object.assign({ id }, params), {
        fileId: options?.fileId,
      }),
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
    options: { ctx: FoxCtx; createNew?: boolean },
  ): Promise<ContentVersion> {
    const createNew = options.createNew || false;
    let versionDetail = await Model.version.getMaxVersionDetailById(contentId);
    if (
      createNew &&
      (!versionDetail || versionDetail.status !== VERSION.STATUS_BASE || versionDetail.deleted)
    ) {
      versionDetail = await this.createNewContentVersion(contentId, { ctx: options.ctx });
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
    const newVersionDetail = (await this.getContentLatestVersion({ contentId })) || {};

    // Set new version information
    newVersionDetail.id = generationId(PRE.CONTENT_VERSION);
    newVersionDetail.contentId = contentId;
    newVersionDetail.content = newVersionDetail?.content || { id: contentId };
    newVersionDetail.status = VERSION.STATUS_BASE as ContentStatus;
    newVersionDetail.version = Service.version.number.getNewVersion(newVersionDetail?.version);
    newVersionDetail.versionNumber = Service.version.number.createNumberFromVersion(
      newVersionDetail?.version,
    );
    newVersionDetail.creator = options.ctx.userInfo.id;

    // Save
    options.ctx.transactions.push(Model.version.addDetailQuery(newVersionDetail));
    return newVersionDetail;
  }

  /**
   * Set the delete status of the version.
   * If the version is live version, you need to check whether the content is referenced
   * @param  {TypeStatus} params
   * @returns Promise
   */
  async setVersionDeleteStatus(
    params: TypeStatus,
    options: { ctx: FoxCtx },
  ): Promise<Record<string, number>> {
    const versionDetail = await this.getDetailById(params.id);
    if (!versionDetail) {
      return { code: 1 }; // Invalid version information
    }

    const contentDetail = await Service.content.info.getDetailById(versionDetail.contentId);

    // TODO In the current version of the live state, you need to check whether the content is referenced
    if (params.status && contentDetail?.liveVersionNumber === versionDetail.versionNumber) {
      return { code: 2 }; // Can not be deleted
    }

    // Set the enabled state
    options.ctx.transactions.push(this.setDeleteStatus(params.id, params.status));
    options.ctx.operations.push(
      ...Service.log.addLogItem(LOG.VERSION_REMOVE, [versionDetail], { fileId: contentDetail?.fileId }),
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
    options: { ctx: FoxCtx; status?: boolean },
  ): void {
    const status = options.status === false ? false : true;
    options.ctx.transactions.push(this.setDeleteStatus(_.map(versionList, 'id'), status));
    options.ctx.operations.push(...Service.log.addLogItem(LOG.VERSION_REMOVE, versionList));
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
    return version as ContentVersion;
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
        versionNumber: contentDetail?.liveVersionNumber || 0,
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
    applicationId: string,
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
          applicationId: applicationId,
          type: TYPE.TEMPLATE as FileTypes,
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
    },
  ): Record<string, Record<string, string>> {
    const dsl = _.cloneDeep(sourceContentVersion);
    dsl.id = contentId;
    // Process the structureId value in schemes and replace the content id value in relation
    dsl.schemas = this.changeDSLStructureIdRecursive(sourceContentVersion.schemas);

    if (dsl.relation) {
      for (const key in dsl.relation) {
        if (options.relations[dsl.relation[key].id]) {
          dsl.relation[key].id = options.relations[dsl.relation[key].id].newId;
        } else if (options.tempRelations[dsl.relation[key].id]) {
          dsl.relation[key].id = options.tempRelations[dsl.relation[key].id].newId;
          options.relations[dsl.relation[key].id] = options.tempRelations[dsl.relation[key].id];
        } else {
          const contentId = generationId(PRE.CONTENT);
          const contentName = key.split(':')[0] || '';
          options.relations[dsl.relation[key].id] = {
            newId: contentId,
            oldName: contentName,
            newName: [contentName, randStr(4)].join('_'),
          };
          dsl.relation[key].id = contentId;
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

    return options.relations;
  }

  /**
   * Update the structureId value in the dsl schema
   * @param  {DslSchemas[]} schemas
   * @returns DslSchemas
   */
  changeDSLStructureIdRecursive(schemas: DslSchemas[], parentId?: string): DslSchemas[] {
    // TODO structure id in props need to replace too
    (schemas || []).forEach((structure) => {
      structure.id = generationId(PRE.STRUCTURE);
      if (structure.parentId) {
        structure.parentId = parentId;
      }

      if (structure.wrapper) {
        structure.wrapper = parentId;
      }

      if (structure.children && structure.children.length > 0) {
        this.changeDSLStructureIdRecursive(structure.children, structure.id);
      }
    });

    return schemas;
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
          for (const key in relations) {
            if (
              [TYPE.TEMPLATE, TYPE.CONDITION, TYPE.FUNCTION].indexOf(relation[matchStr]?.type) !== -1 &&
              key === matchArr[1]
            ) {
              matchArr[1] = relations[key].newId;
              schemasString = _.replace(
                schemasString,
                new RegExp(match, 'gm'),
                '{{' + matchArr.join(':') + '}}',
              );
              break;
            } else if (relations[key].oldName === matchRelationName) {
              matchArr[0] = relations[key].newName;
              schemasString = _.replace(
                schemasString,
                new RegExp(match, 'gm'),
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
          item === relationArr[1]
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
}
