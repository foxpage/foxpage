import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentStatus, DSL, FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE, VERSION } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AddProjectRelationsReq, AddProjectRelationsRes } from '../../types/validates/project-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('projects')
export class AddProjectRelationsByClone extends BaseController {
  constructor() {
    super();
  }

  /**
   * Create relation item details to target project
   * 1: check relations is app level or not;
   * 2: create non app level relations;
   * 3: replace schemas relation name
   * 4: response new relation maps and schemas;
   * @param  {AddProjectRelationsReq} params
   * @param  {Header} headers
   * @returns any
   */
  @Post('/relations-clone')
  @OpenAPI({
    summary: i18n.sw.addProjectRelationsByClone,
    description: '',
    tags: ['Project'],
    operationId: 'add-project-relations-by-clone',
  })
  @ResponseSchema(AddProjectRelationsRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: AddProjectRelationsReq,
  ): Promise<ResData<Record<string, DSL>>> {
    const { applicationId = '', contentId = '', relationSchemas = {} } = params;
    const relationIds = _.uniq(_.map(_.toArray(relationSchemas.relation || {}), 'id'));

    try {
      const hasAuth = await this.service.auth.content(contentId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4041001);
      }

      if (relationIds.length === 0) {
        return Response.success({ relationMaps: {}, relationSchemas }, 1041002);
      }

      // check relation ids and content id
      const [relationList, contentDetail, appDetail, appDefaultFolderIds] = await Promise.all([
        this.service.content.list.getDetailByIds(relationIds),
        this.service.content.info.getDetailById(contentId),
        this.service.application.getDetailById(applicationId),
        this.service.folder.info.getAppDefaultItemFolderIds(applicationId),
      ]);
      const notInAppRelationIds = _(relationList)
        .filter((item) => item.applicationId !== applicationId)
        .map('id')
        .value();
      if (notInAppRelationIds.length > 0) {
        return Response.warning(
          i18n.project.relationNotInApp + ': ' + notInAppRelationIds.join(','),
          2041001,
        );
      }

      if (this.notValid(contentDetail) || contentDetail.applicationId !== applicationId) {
        return Response.warning(i18n.content.invalidContentId, 2041002);
      }

      const appRelationIds = await this.service.content.check.appLevelContent({
        list: relationList,
        appFolderIds: appDefaultFolderIds,
      });
      const notAppRelationContentIds = _.difference(relationIds, appRelationIds);

      let relations: Record<string, DSL[]> = {};
      let relationIdMaps: Record<string, string> = {};
      let newDSL: Partial<DSL> = {};
      if (appRelationIds.length > 0) {
        const relationObject = _.keyBy(relationList, 'id');
        const appRelationObject = await this.service.version.list.getLiveVersionByContentIds(appRelationIds);
        _.forIn(appRelationObject, (item, key) => {
          if (relationObject[key].type) {
            const relationType = relationObject[key].type + 's';
            !relations[relationType] && (relations[relationType] = []);
            relations[relationType].push(item.content);
          }
        });
      }

      // create new relation detail
      if (notAppRelationContentIds.length > 0) {
        const relationAndDepsList = await this.service.relation.getRelationsAndDeps(notAppRelationContentIds);

        // check relation deps whether or not is app level
        const depsRelationFileIds = _(relationAndDepsList)
          .filter((item) => notAppRelationContentIds.indexOf(item.id) === -1)
          .map('fileId')
          .value();

        const [appDepsRelationFileIds, targetFileDetail, relationFileList] = await Promise.all([
          this.service.file.check.appLevelFile({
            ids: depsRelationFileIds,
            appFolderIds: appDefaultFolderIds,
          }),
          this.service.file.info.getDetailById(contentDetail.fileId),
          this.service.file.list.getDetailByIds(_.map(relationAndDepsList, 'fileId')),
        ]);
        const relationFileObject = _.keyBy(relationFileList, 'id');
        const notAppDepsRelationContentIds = _(relationAndDepsList)
          .filter((item) => appDepsRelationFileIds.indexOf(item.fileId) === -1)
          .map('id')
          .value();

        // create new relations
        let idMaps: Record<string, any> = {};
        const appTemplateFileIds = _.map(appDetail?.setting?.template || [], 'id');
        for (const item of _.reverse(relationAndDepsList)) {
          if (notAppDepsRelationContentIds.indexOf(item.id) === -1 || !item.version) {
            continue;
          }

          // relation is template and template has upto sidebar or is in same project
          if (
            item.content.type === TYPE.TEMPLATE &&
            (appTemplateFileIds.indexOf(item.fileId) !== -1 ||
              relationFileObject[item.fileId].folderId === targetFileDetail.folderId)
          ) {
            continue;
          }

          const newVersionObject = this.service.version.info.createCopyVersion(
            item.version.content,
            idMaps,
            true,
          );
          idMaps = Object.assign({}, idMaps, newVersionObject.idNameMaps);

          const relationCommInfo = {
            applicationId: params.applicationId,
            name:
              relationFileObject[item.fileId]?.type === TYPE.TEMPLATE
                ? relationFileObject[item.fileId]?.name
                : newVersionObject.newVersion.schemas[0]?.name || '',
            type: item.content.type as FileTypes,
            subType: relationFileObject[item.fileId]?.subType || '',
            folderId: targetFileDetail.folderId,
            creator: ctx.userInfo.id,
          };

          // save new relation, set to live by default
          const relationFileInfo = this.service.file.info.create(relationCommInfo, { ctx });
          const relationVersionInfo = this.service.version.info.create(
            Object.assign({}, relationCommInfo, {
              contentId: newVersionObject.newVersion.id,
              content: newVersionObject.newVersion,
              status: VERSION.STATUS_RELEASE as ContentStatus,
            }),
            { ctx },
          );
          this.service.content.info.create(
            Object.assign({}, relationCommInfo, {
              id: newVersionObject.newVersion.id,
              title: relationCommInfo.name,
              fileId: relationFileInfo.id,
              liveVersionId: relationVersionInfo.id,
              liveVersionNumber: 1,
            }),
            { ctx },
          );
          const relationType = item.content.type + 's';
          !relations[relationType] && (relations[relationType] = []);
          relations[relationType].push(newVersionObject.newVersion);
          relationIdMaps[item.id] = newVersionObject.newVersion.id;
        }

        // replace schemas relation names
        const newSchemaResult = this.service.version.info.createCopyVersion(relationSchemas as DSL, idMaps);
        newDSL = newSchemaResult.newVersion || {};

        await this.service.version.info.runTransaction(ctx.transactions);
      }

      return Response.success(
        { relationIdMaps, relations, relationSchemas: _.omit(newDSL, ['id']) },
        1041001,
      );
    } catch (err) {
      return Response.error(err, i18n.project.cloneRelationsFailed, 3041001);
    }
  }
}
