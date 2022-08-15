import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG, TYPE, VERSION } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { FileDetailRes, UpdateTypeFileDetailReq } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { checkName } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('mocks')
export class UpdateMockDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update the mock details,
   * only update the mock name and introduction, type,
   * and update the content name and version content.
   * @param  {UpdateTypeFileDetailReq} params
   * @returns {File}
   */
  @Put('')
  @OpenAPI({
    summary: i18n.sw.updateMockDetail,
    description: '',
    tags: ['Mock'],
    operationId: 'update-mock-detail',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateTypeFileDetailReq): Promise<ResData<File>> {
    // Check the validity of the name
    if (!checkName(params.name)) {
      return Response.warning(i18n.mock.invalidMockName, 2191501);
    }

    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.MOCK });
      const hasAuth = await this.service.auth.file(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4191501);
      }

      // Get the contents of the file
      const contentList = await this.service.content.file.getContentByFileIds([params.id]);
      const contentId = contentList[0]?.id || '';
      const contentName = params.name || contentList[0]?.title;
      let versionId = '';
      let versionNumber = 1;
      let versionStatus = '';
      // Get the version of the content
      if (contentId) {
        const versionDetail = await this.service.version.info.getContentLatestVersion({
          contentId,
          deleted: false,
        });
        versionId = versionDetail.id || '';
        versionStatus = <string>versionDetail.status;
        versionNumber = versionDetail.versionNumber || 1;
      }

      const result = await this.service.file.info.updateFileDetail(params, {
        ctx,
        actionType: [LOG.UPDATE, TYPE.MOCK].join('_'),
      });

      if (result.code === 1) {
        return Response.warning(i18n.mock.invalidMockId, 2191502);
      }

      if (result.code === 2) {
        return Response.warning(i18n.mock.mockNameExist, 2191503);
      }

      this.service.content.info.updateContentItem(contentId, { title: contentName }, { ctx });
      if (versionStatus === VERSION.STATUS_BASE) {
        this.service.version.info.updateVersionItem(versionId, { content: params.content }, { ctx });
      } else {
        // Add new version
        const version = this.service.version.number.getVersionFromNumber(++versionNumber);
        this.service.version.info.create(
          { contentId, version, versionNumber, content: params.content },
          { ctx, fileId: params.id },
        );
      }

      await this.service.file.info.runTransaction(ctx.transactions);
      const fileDetail = await this.service.file.info.getDetailById(params.id);

      return Response.success(fileDetail, 1191501);
    } catch (err) {
      return Response.error(err, i18n.mock.updateMockFailed, 3191501);
    }
  }
}
