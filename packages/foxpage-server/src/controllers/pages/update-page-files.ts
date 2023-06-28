import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { FileDetailRes, UpdateFileDetailReq } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { checkName } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController()
export class UpdatePageDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update file details, only file name and introduction can be updated
   * @param  {UpdateFileDetailReq} params
   * @returns {File}
   */
  @Put('pages')
  @Put('templates')
  @Put('blocks')
  @OpenAPI({
    summary: i18n.sw.updatePageDetail,
    description: '',
    tags: ['Page'],
    operationId: 'update-page-detail',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateFileDetailReq): Promise<ResData<File>> {
    // Check the validity of the name
    if (!checkName(params.name) || !params.name) {
      return Response.warning(i18n.file.invalidName, 2051801);
    }

    try {
      const apiType = this.getRoutePath(ctx.request.url);

      ctx.logAttr = Object.assign(ctx.logAttr, { type: apiType });
      let [hasAuth, pageDetail] = await Promise.all([
        this.service.auth.file(params.id, { ctx }),
        this.service.file.info.getDetailById(params.id),
      ]);

      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4051801);
      } else if (
        this.notValid(pageDetail) ||
        pageDetail.applicationId !== params.applicationId ||
        pageDetail.type !== apiType
      ) {
        return Response.warning(i18n.page.invalidTypeIdOrAppId, 2051802);
      }

      params.tags = this.service.content.tag.formatTags(apiType, params.tags);
      const result = await this.service.file.info.updateFileDetail(params, {
        ctx,
        actionDataType: apiType,
        actionType: [LOG.UPDATE, apiType].join('_'),
      });

      if (result.code === 1) {
        return Response.warning(i18n.page.invalidPageId, 2051803);
      } else if (result.code === 2) {
        return Response.warning(i18n.page.pageNameExist, 2051804);
      } else if (result.code === 3) {
        // Check if the path of the file already exists
        return Response.warning(
          i18n.file.pathNameExist + ':"' + ((result.data || []) as string[]).join(',') + '"',
          2051805,
        );
      }

      await this.service.file.info.runTransaction(ctx.transactions);
      pageDetail = await this.service.file.info.getDetailById(params.id);

      return Response.success(pageDetail, 1051801);
    } catch (err) {
      return Response.error(err, i18n.file.updateFailed, 3051801);
    }
  }
}
