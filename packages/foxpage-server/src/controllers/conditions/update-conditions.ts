import 'reflect-metadata';

import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE, VERSION } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { FileDetailRes, UpdateTypeFileDetailReq } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { checkName } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('conditions')
export class UpdateConditionDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update condition details,
   * only condition name and introduction, type, content name and version content can be updated
   * @param  {UpdateTypeFileDetailReq} params
   * @returns {File}
   */
  @Put('')
  @OpenAPI({
    summary: i18n.sw.updateConditionFileContentDetail,
    description: '',
    tags: ['Condition'],
    operationId: 'update-condition-file-content-detail',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateTypeFileDetailReq): Promise<ResData<File>> {
    // Check the validity of the name
    if (!checkName(params.name)) {
      return Response.warning(i18n.condition.invalidConditionName, 2101601);
    }

    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.CONDITION });

      // Permission check
      const hasAuth = await this.service.auth.file(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4101601);
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

      const result = await this.service.file.info.updateFileDetail(params, { ctx });

      if (result.code === 1) {
        return Response.warning(i18n.condition.invalidConditionId, 2101602);
      }

      if (result.code === 2) {
        return Response.warning(i18n.condition.conditionNameExist, 2101603);
      }

      this.service.content.info.updateContentItem(
        contentId,
        { title: contentName },
        { ctx, fileId: params.id },
      );

      if (versionStatus === VERSION.STATUS_BASE) {
        // Update version
        this.service.version.info.updateVersionItem(
          versionId,
          { content: params.content },
          { ctx, fileId: params.id },
        );
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

      return Response.success(fileDetail, 1101601);
    } catch (err) {
      return Response.error(err, i18n.condition.updateConditionFailed, 3101601);
    }
  }
}
