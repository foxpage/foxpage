import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes, Content, ContentStatus, File, FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { COMPONENT_TYPE, PRE, TAG, TYPE, VERSION } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { SaveEditorPackageReq } from '../../types/validates/component-validate-types';
import { ResponseBase } from '../../types/validates/index-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('components')
export class SaveEditorComponents extends BaseController {
  constructor() {
    super();
  }

  /**
   * Save multi editor, if not exist, add it
   * @param  {SaveRemotePackageReq} params
   * @returns {NewResourceDetail}
   */
  @Post('/editor-batch')
  @OpenAPI({
    summary: i18n.sw.saveRemoteComponents,
    description: '',
    tags: ['Component'],
    operationId: 'save-editor-component-list',
  })
  @ResponseSchema(ResponseBase)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: SaveEditorPackageReq,
  ): Promise<ResData<Record<string, any>[]>> {
    try {
      const hasAuth = await this.service.auth.application(params.applicationId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4112101);
      }

      // get app component type folder id
      const componentFolderId = await this.service.folder.info.getAppTypeFolderId({
        applicationId: params.applicationId,
        type: TYPE.COMPONENT as AppFolderTypes,
      });

      // Get editor list
      const editorNames = _.map(params.components, 'name');
      const editorFiles = await this.service.file.list.find({
        applicationId: params.applicationId,
        folderId: componentFolderId,
        name: { $in: editorNames },
        deleted: false,
      });
      const notExistEditors: string[] = _.pullAll(editorNames, _.map(editorFiles, 'name'));

      // get editor path's match contentId
      let invalidEditorPath: string[] = [];
      await Promise.all(
        _.map(params.components, async (item) => {
          const browser = item.component?.content?.resource?.entry?.browser || '';
          if (browser && !_.startsWith(browser, PRE.CONTENT + '_')) {
            const contentId = await this.service.resource.getContentIdByPath(
              item.groupId,
              _.drop(browser.split('/')),
            );
            !contentId && invalidEditorPath.push(browser);

            item.component.content.resource.entry.browser = contentId;
          }
        }),
      );

      if (invalidEditorPath.length > 0) {
        return Response.accessDeny(i18n.resource.invalidPath, 2112101);
      }

      // add new editor
      let newVersion: Record<string, any> = {};
      let editorNameMap: Record<string, any> = {};
      const nameFileDetail: Record<string, File> = {};
      const nameContentDetail: Record<string, Content> = {};
      const editorObject = _.keyBy(params.components, 'name');
      for (const name of notExistEditors) {
        nameFileDetail[name] = this.service.file.info.create(
          {
            applicationId: params.applicationId,
            name,
            folderId: componentFolderId,
            type: TYPE.EDITOR as FileTypes,
            componentType: editorObject[name]?.componentType || COMPONENT_TYPE.REACT_COMPONENT,
            tags: [{ type: TAG.RESOURCE_GROUP, resourceGroupId: editorObject[name]?.groupId || '' }],
          },
          { ctx, actionDataType: TYPE.EDITOR },
        );

        nameContentDetail[name] = this.service.content.info.create(
          {
            title: _.trim(name),
            fileId: nameFileDetail[name].id,
            applicationId: params.applicationId,
            type: TYPE.EDITOR,
          },
          { ctx },
        );

        if (editorObject[name]?.component?.content?.schema) {
          editorObject[name].component.content.schema = JSON.stringify(
            editorObject[name]?.component?.content.schema,
          );
        }

        this.service.version.info.create(
          {
            contentId: nameContentDetail[name].id,
            version: '0.0.1',
            versionNumber: 1,
            status: <ContentStatus>VERSION.STATUS_BASE,
            content: Object.assign(
              { id: nameContentDetail[name].id },
              editorObject[name]?.component?.content,
            ),
          },
          { ctx },
        );

        editorNameMap[name] = { id: nameContentDetail[name].id || '', version: '0.0.1' };
      }

      // Get file content ids, get editor latest version
      const fileContent = await this.service.content.file.getContentByFileIds(_.map(editorFiles, 'id'));
      const maxContentVersion = await this.service.version.list.getContentMaxVersionDetail(
        _.map(fileContent, 'id'),
      );

      // check need create version editor
      const contentObject = _.keyBy(fileContent, 'id');
      for (const contentId in maxContentVersion) {
        const versionBrowserId = maxContentVersion[contentId].content?.resource?.entry?.browser;
        if (editorObject[contentObject[contentId].title]) {
          const newVersionBrowserId =
            editorObject[contentObject[contentId].title].component?.content?.resource?.entry?.browser;

          if (newVersionBrowserId && newVersionBrowserId !== versionBrowserId) {
            newVersion[contentId] = {
              contentId: contentId,
              versionNumber: maxContentVersion[contentId].versionNumber + 1,
              content: editorObject[contentObject[contentId].title].component?.content || {},
            };
            editorNameMap[contentObject[contentId].title] = {
              id: contentId || '',
              version: this.service.version.number.getVersionFromNumber(
                maxContentVersion[contentId].versionNumber + 1,
              ),
            };
          } else {
            editorNameMap[contentObject[contentId].title] = {
              id: contentId || '',
              version: this.service.version.number.getVersionFromNumber(
                maxContentVersion[contentId].versionNumber,
              ),
            };
          }
        }
      }

      // create new version
      for (const contentId in newVersion) {
        if (newVersion[contentId].content?.schema) {
          newVersion[contentId].content.schema = JSON.stringify(newVersion[contentId].content.schema);
        }

        this.service.version.info.create(
          {
            contentId: contentId,
            version: this.service.version.number.getVersionFromNumber(newVersion[contentId].versionNumber),
            versionNumber: newVersion[contentId].versionNumber,
            status: <ContentStatus>VERSION.STATUS_BASE,
            content: Object.assign({ id: contentId }, newVersion[contentId].content || {}),
          },
          { ctx },
        );
      }

      await this.service.file.info.runTransaction(ctx.transactions);

      return Response.success(editorNameMap, 1112101);
    } catch (err) {
      return Response.error(err, i18n.component.saveRemoteComponentFailed, 3112101);
    }
  }
}
