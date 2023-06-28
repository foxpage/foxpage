import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TAG } from '../../../config/constant';
import { ContentInfo } from '../../types/content-types';
import { ResData } from '../../types/index-types';
import { ComponentFileContentReq } from '../../types/validates/component-validate-types';
import { ContentVersionDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

interface FileContentDetail extends ContentInfo {
  liveVersion: string;
  type?: string;
  online?: boolean;
  file?: File;
}

@JsonController('components')
export class GetComponentVersionDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the content details of the component
   * @param  {ContentVersionDetailReq} params
   * @returns {ContentVersion}
   */
  @Get('/contents')
  @OpenAPI({
    summary: i18n.sw.getComponentContentDetail,
    description: '',
    tags: ['Component'],
    operationId: 'get-component-content-detail',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@QueryParams() params: ComponentFileContentReq): Promise<ResData<FileContentDetail>> {
    try {
      const fileDetail = await this.service.file.info.getDetailById(params.id);
      if (this.notValid(fileDetail)) {
        return Response.warning(i18n.component.invalidFileId, 2110501);
      }

      let fileId = params.id;
      if (fileDetail.tags && fileDetail.tags?.[0]?.type === TAG.DELIVERY_REFERENCE) {
        fileId = fileDetail.tags?.[0]?.reference?.id || '';
      }

      const contentDetail = await this.service.content.info.getDetail({ fileId: fileId, deleted: false });
      if (this.notValid(contentDetail)) {
        return Response.warning(i18n.component.invalidFileId, 2110502);
      }

      // Get user info and component online store info
      const [userObject, onlineInfo] = await Promise.all([
        this.service.user.getUserBaseObjectByIds([contentDetail.creator]),
        this.service.store.goods.getDetailByTypeId(fileId),
      ]);

      const contentUserInfo = Object.assign(
        {},
        {
          type: fileDetail.type || '',
          fileId: params.id,
          file: fileDetail,
          creator: userObject[contentDetail.creator] || {},
          liveVersion: <string>(
            this.service.version.number.getVersionFromNumber(contentDetail.liveVersionNumber)
          ),
          online: !!(
            params.id === fileId &&
            onlineInfo &&
            onlineInfo.id &&
            onlineInfo.status === 1 &&
            !onlineInfo.deleted
          ),
        },
        _.omit(contentDetail, ['creator', 'fileId']),
      ) as FileContentDetail;

      return Response.success(contentUserInfo, 1110501);
    } catch (err) {
      return Response.error(err, i18n.component.getComponentContentDetailFailed, 3110501);
    }
  }
}
