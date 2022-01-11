import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TAG } from '../../../config/constant';
import { NewResourceDetail } from '../../types/file-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { SaveRemotePackageReq } from '../../types/validates/component-validate-types';
import { ResponseBase } from '../../types/validates/index-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('components')
export class SaveRemoteComponents extends BaseController {
  constructor() {
    super();
  }

  /**
   * Check if remote resources exist,
   *    if not, add it, then response the mapping of content id and path
   *    if exist, get resource content id and mapping with path
   * Add content and version detail if component version not exist
   * @param  {SaveRemotePackageReq} params
   * @returns {NewResourceDetail}
   */
  @Post('/batch')
  @OpenAPI({
    summary: i18n.sw.saveRemoteComponents,
    description: '',
    tags: ['Component'],
    operationId: 'save-remote-component-list',
  })
  @ResponseSchema(ResponseBase)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: SaveRemotePackageReq,
  ): Promise<ResData<NewResourceDetail[]>> {
    try {
      let componentFileIds: string[] = [];
      params.components.map((item) => {
        item?.component?.id && componentFileIds.push(item.component.id);
      });

      let fileContentObject: Record<string, Content> = {};
      if (componentFileIds.length > 0) {
        fileContentObject = await this.service.content.list.getContentObjectByFileIds(componentFileIds);
      }

      let errMsg: Record<string, number | string | string[]> = {};
      for (const item of params.components) {
        const checkResult = await this.service.resource.checkRemoteResourceExist([item.resource], {
          id: item.resource.groupId,
          applicationId: params.applicationId,
        });

        const entries = item.component.content?.resource?.entry || {};
        let editorEntry = item.component.content?.resource?.['editor-entry'][0] || {};

        if (checkResult.code === 0) {
          // Resource not exist
          const contentIdMap = this.service.resource.saveResources([item.resource], {
            ctx,
            applicationId: params.applicationId,
            folderId: item.resource.groupId,
          });

          // Mapping component entry and resource content id
          for (const entryItem in entries) {
            if (!entries[entryItem]?.contentId && entries[entryItem]?.path) {
              // need to remove groupName, resourceName and version in entries[entryItem]
              entries[entryItem] = _.get(
                contentIdMap[item.resource.resourceName],
                _.drop(<string[]>entries[entryItem].path.split('/'), 3),
              );
            }
          }

          if (editorEntry.path) {
            editorEntry.id = _.get(
              contentIdMap[item.resource.resourceName],
              _.drop(<string[]>editorEntry.path.split('/'), 3),
            );
            delete editorEntry.contentId;
            delete editorEntry.path;
          }
        } else {
          // Resource exist, replace it by content id direct
          const pathPre = [
            item.resource.groupName,
            item.resource.resourceName,
            item.resource.version,
            '',
          ].join('/');
          for (const entryItem in entries) {
            const itemPath: string = entries[entryItem]?.path || '';
            if (checkResult.contentPath?.[item.resource.id]?.[_.replace(itemPath, pathPre, '')]) {
              entries[entryItem] =
                checkResult.contentPath[item.resource.id][_.replace(itemPath, pathPre, '')];
            }
          }

          if (editorEntry.path) {
            if (checkResult.contentPath?.[item.resource.id]?.[_.replace(editorEntry.path, pathPre, '')]) {
              editorEntry.id =
                checkResult.contentPath[item.resource.id][_.replace(editorEntry.path, pathPre, '')];
            }
            delete editorEntry.contentId;
            delete editorEntry.path;
          }
        }

        // Save component info
        let componentContentId = fileContentObject[item.component.id]?.id || '';
        if (!componentContentId) {
          // Add component content
          const contentDetail = this.service.content.info.create(
            { title: item.resource.name || '', fileId: item.component.id },
            { ctx },
          );
          componentContentId = contentDetail.id;
        }

        // Check if version has exist, and check file group resource tag
        const [versionDetail, componentFileDetail] = await Promise.all([
          this.service.version.info.find({
            contentId: componentContentId,
            version: item.component.version,
            deleted: false,
          }),
          this.service.file.info.getDetailById(item.component.id),
        ]);

        // Version has exist
        if (versionDetail.length > 0 || _.has(versionDetail[0], 'id')) {
          errMsg = {
            code: 1,
            data: [fileContentObject[item.component.id]?.title || '', item.component.version],
          };
          break;
        }

        // Update file tag
        const fileTags: Record<string, any>[] = componentFileDetail.tags || [];
        const fileResourceGroupDetail = _.find(fileTags, (tag) => {
          return tag.type === TAG.RESOURCE_GROUP && tag.resourceGroupId;
        });
        if (!fileResourceGroupDetail || !fileResourceGroupDetail.resourceGroupId) {
          fileTags.push({ type: TAG.RESOURCE_GROUP, resourceGroupId: item.resource.groupId });
          ctx.transactions.push(
            this.service.file.info.updateDetailQuery(item.component.id, { tags: fileTags }),
          );
        }

        // Add component new version
        this.service.version.info.create(
          {
            contentId: componentContentId,
            version: item.component.version,
            versionNumber: this.service.version.number.createNumberFromVersion(item.component.version),
            content: Object.assign({ id: componentContentId }, item.component.content || {}),
          },
          { ctx },
        );
      }

      // Response error msg
      if (errMsg.code) {
        return Response.warning(i18n.component.versionExist + ':' + (<string[]>errMsg.data).join(','));
      }

      await this.service.file.info.runTransaction(ctx.transactions);

      return Response.success(i18n.component.saveRemoteComponentSuccess);
    } catch (err) {
      return Response.error(err, i18n.component.saveRemoteComponentFailed);
    }
  }
}
