import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content, File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { ACTION, LOG, TYPE, VERSION } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { FileDetailRes, UpdateTypeFileDetailReq } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { checkName } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController()
export class UpdateTypeItemDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update the type item [variable|condition|function|mock|..] details,
   * only update the name and introduction, type,
   * and update the content name and version content.
   * @param  {UpdateTypeFileDetailReq} params
   * @returns {File}
   */
  @Put('variables')
  @Put('conditions')
  @Put('functions')
  @Put('mocks')
  @OpenAPI({
    summary: i18n.sw.updateVariableDetail,
    description: '',
    tags: ['File'],
    operationId: 'update-type-item-detail',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateTypeFileDetailReq): Promise<ResData<File>> {
    // Check the validity of the name
    if (!checkName(params.name)) {
      return Response.warning(i18n.file.invalidName, 2171501);
    }

    try {
      const apiType = this.getRoutePath(ctx.request.url);
      ctx.logAttr = Object.assign(ctx.logAttr, { type: apiType });

      let [hasAuth, fileDetail] = await Promise.all([
        this.service.auth.file(params.pageFileId || params.id, { ctx }),
        this.service.file.info.getDetailById(params.id),
      ]);

      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4171501);
      }

      // file id is invalid or type is not mapping
      if (
        this.notValid(fileDetail) ||
        fileDetail.applicationId !== params.applicationId ||
        fileDetail.type !== apiType
      ) {
        return Response.warning(i18n.file.invalidFileId, 2171504);
      }

      // Get the contents of the file
      const contentList = await this.service.content.file.getContentByFileIds([params.id]);
      let contentDetail: Partial<Content> = {};
      if (params.contentId) {
        contentDetail = _.find(contentList, { id: params.contentId }) as Content;
      } else {
        contentDetail = contentList[0];
      }

      const contentId = contentDetail?.id || '';
      const contentName = params.name || contentDetail?.title;
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
        actionType: [LOG.UPDATE, apiType].join('_'),
      });

      if (result.code === 1) {
        return Response.warning(i18n.file.invalidFileId, 2171502);
      }

      if (result.code === 2) {
        return Response.warning(i18n.file.nameExist, 2171503);
      }

      // format mock schema props value
      if (apiType === TYPE.MOCK && params.content?.schemas) {
        params.content.schemas = this.service.version.info.formatMockValue(
          params.content.schemas,
          ACTION.SAVE,
        );
      }

      this.service.content.info.updateContentItem(
        contentId,
        { title: contentName },
        { ctx, actionDataType: apiType },
      );
      if (versionStatus === VERSION.STATUS_BASE) {
        this.service.version.info.updateVersionItem(
          versionId,
          { content: params.content },
          { ctx, actionDataType: apiType },
        );
      } else {
        // Add new version
        const version = this.service.version.number.getVersionFromNumber(++versionNumber);
        this.service.version.info.create(
          { contentId, version, versionNumber, content: params.content },
          { ctx, fileId: params.id, actionDataType: apiType },
        );
      }

      await this.service.file.info.runTransaction(ctx.transactions);
      fileDetail = await this.service.file.info.getDetailById(params.id);

      return Response.success(Object.assign({ contentId }, fileDetail), 1171501);
    } catch (err) {
      return Response.error(err, i18n.file.updateTypeItemFailed, 3171501);
    }
  }
}
