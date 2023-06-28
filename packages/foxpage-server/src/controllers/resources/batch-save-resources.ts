import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { FoxCtx, ResData } from '../../types/index-types';
import { FileListRes } from '../../types/validates/file-validate-types';
import { SaveResourceListReq } from '../../types/validates/resource-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('resources')
export class SaveRemoteResourceList extends BaseController {
  constructor() {
    super();
  }

  /**
   * @param  {FileListReq} params
   * @returns {FileFolderInfo}
   */
  @Post('/batch')
  @OpenAPI({
    summary: i18n.sw.saveBatchResources,
    description: '',
    tags: ['Resource'],
    operationId: 'save-batch-resources',
  })
  @ResponseSchema(FileListRes)
  async index (@Ctx() ctx: FoxCtx, @Body() params: SaveResourceListReq): Promise<ResData<any[]>> {
    try {
      // Check permission
      const hasAuth = await this.service.auth.application(params.applicationId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4120501);
      }

      const checkResult = await this.service.resource.checkRemoteResourceExist(
        params.resources,
        _.pick(params, ['id', 'applicationId']),
      );

      if (checkResult.code === 1) {
        return Response.warning(
          i18n.resource.versionExist + ':' + (<string[]>checkResult.data).join(','),
          2120501,
        );
      } else if (checkResult.code === 2) {
        return Response.warning(
          i18n.resource.nameExist + ':' + (<string[]>checkResult.data).join(','),
          2120502,
        );
      }

      // Add resource version
      const idMaps = this.service.resource.saveResources(params.resources, {
        ctx,
        applicationId: params.applicationId,
        folderId: params.id,
      });

      await this.service.folder.info.runTransaction(ctx.transactions);

      return Response.success(idMaps, 1120501);
    } catch (err) {
      return Response.error(err, i18n.resource.saveResourcesFailed, 3120501);
    }
  }
}
