import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Folder } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG, TAG, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { ContentVersionDetailRes } from '../../types/validates/content-validate-types';
import { UpdateResourceConfigReq } from '../../types/validates/resource-validate-types';
import * as Response from '../../utils/response';
import { formatToPath } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('resources')
export class UpdateResourceGroup extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update resource group name and config
   * @param  {UpdateResourceConfigReq} params
   * @returns {Folder}
   */
  @Put('/group')
  @OpenAPI({
    summary: i18n.sw.updateResourceGroupConfig,
    description: '',
    tags: ['Resource'],
    operationId: 'update-resource-group',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateResourceConfigReq): Promise<ResData<Folder>> {
    try {
      if (!params.name) {
        return Response.warning(i18n.resource.invalidName, 2122201);
      }

      const hasAuth = await this.service.auth.application(params.applicationId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4122201);
      }

      let groupDetail = await this.service.folder.info.getDetailById(params.id);
      let tags = _.cloneDeep(groupDetail.tags || []);

      // Check id is a group id
      let isGroup = false;
      tags.forEach((tag, index) => {
        if (tag.type === TAG.RESOURCE_GROUP && tag.resourceId) {
          isGroup = true;
        } else if (tag.type === TAG.RESOURCE_CONFIG) {
          tags.splice(index, 1);
        }
      });

      if (!isGroup) {
        return Response.warning(i18n.resource.invalidResourceGroupId, 2122202);
      }

      // Check if group name has exist
      const resourceTag = _.find(groupDetail.tags, 'resourceId') as Record<string, any>;
      const existGroup = await this.service.folder.list.find({
        parentFolderId: groupDetail.parentFolderId,
        id: { $ne: params.id },
        name: params.name,
        deleted: false,
        'tags.type': TAG.RESOURCE_CONFIG,
        'tags.resourceId': resourceTag.resourceId,
      });

      if (existGroup.length > 0) {
        return Response.warning(i18n.resource.groupNameExist, 2122203);
      }

      tags.push(Object.assign({ type: TAG.RESOURCE_CONFIG }, params.config));

      await this.service.folder.info.updateDetail(params.id, {
        name: params.name,
        folderPath: formatToPath(params.name),
        tags,
        intro: params.intro || groupDetail.intro,
      });
      this.service.userLog.addLogItem(groupDetail, {
        ctx,
        actions: [LOG.UPDATE, TYPE.RESOURCE, TYPE.FOLDER],
        category: { folderId: params.id },
      });

      groupDetail = await this.service.folder.info.getDetailById(params.id);

      return Response.success(groupDetail, 1122201);
    } catch (err) {
      return Response.error(err, i18n.resource.updateResourceConfigFailed, 3122201);
    }
  }
}
