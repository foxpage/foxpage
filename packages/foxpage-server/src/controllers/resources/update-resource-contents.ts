import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content, ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { PRE, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { ContentVersionDetailRes } from '../../types/validates/content-validate-types';
import { UpdateResourceContentReq } from '../../types/validates/resource-validate-types';
import * as Response from '../../utils/response';
import { generationId } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('resources')
export class UpdateResourceContentDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update resource content information, need to update file name, content name
   * @param  {ContentVersionDetailRes} params
   * @param  {Header} headers
   * @returns {ContentVersion}
   */
  @Put('/contents')
  @OpenAPI({
    summary: i18n.sw.updateResourceContentDetail,
    description: '',
    tags: ['Resource'],
    operationId: 'update-resource-content-detail',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: UpdateResourceContentReq,
  ): Promise<ResData<ContentVersion>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.RESOURCE });

      const hasAuth = await this.service.auth.file(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4122001);
      }

      // TODO Need to optimize access to content details and check the validity of the content
      const [fileDetail, contentList] = await Promise.all([
        this.service.file.info.getDetailById(params.id),
        this.service.content.file.getContentByFileIds([params.id]),
      ]);

      const fileTitleArr = (_.last(params.content.realPath?.split('/')) || '').split('.');
      const newFileName = fileTitleArr[0] + '.' + _.last(fileTitleArr);
      if (fileTitleArr.length < 2) {
        return Response.warning(i18n.resource.invalidName, 2122001);
      }

      const contentDetail: Content = contentList[0] || {};
      const folderId = fileDetail.folderId || '';

      // Get resource version details
      let [versionDetail, checkFileDetail] = await Promise.all([
        this.service.version.info.getDetail({ contentId: contentDetail.id, deleted: false }),
        this.service.file.info.getDetail({
          applicationId: params.applicationId,
          folderId,
          name: newFileName,
          deleted: false,
        }),
      ]);

      if (checkFileDetail && checkFileDetail.id !== fileDetail.id) {
        return Response.warning(i18n.resource.nameExist, 2122002);
      }

      const versionId: string = versionDetail ? versionDetail.id : generationId(PRE.CONTENT_VERSION);
      if (versionDetail) {
        this.service.version.info.updateVersionItem(versionDetail.id, { content: params.content }, { ctx });
        this.service.content.info.updateContentItem(contentDetail.id, { title: newFileName }, { ctx });
        this.service.file.info.updateFileItem(params.id, { name: newFileName }, { ctx });
      } else {
        // Create version details if it does not exist
        const newVersionDetail: Partial<ContentVersion> = {
          id: versionId,
          contentId: params.id,
          status: 'release',
          version: '',
          versionNumber: 0,
          content: params.content,
        };
        this.service.version.info.create(newVersionDetail, { ctx });
        this.service.content.info.updateContentItem(params.id, { title: newFileName }, { ctx });
        this.service.file.info.updateFileItem(fileDetail.id, { name: newFileName }, { ctx });
      }

      await this.service.content.info.runTransaction(ctx.transactions);

      versionDetail = await this.service.version.info.getDetailById(versionId);

      return Response.success(versionDetail, 1122001);
    } catch (err) {
      return Response.error(err, i18n.resource.updateAssetContentFailed, 3122001);
    }
  }
}
