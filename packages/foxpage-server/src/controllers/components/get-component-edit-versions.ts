import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { ResData } from '../../types/index-types';
import { ComponentVersionEditReq } from '../../types/validates/component-validate-types';
import { ContentVersionDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

interface ContentVersionWithType extends ContentVersion {
  componenType: string;
}

@JsonController('components')
export class GetComponentVersionDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the version details of the component
   * @param  {ContentVersionDetailReq} params
   * @returns {ContentVersion}
   */
  @Get('/edit-versions')
  @OpenAPI({
    summary: i18n.sw.getComponentEditVersionDetail,
    description: '',
    tags: ['Component'],
    operationId: 'get-component-edit-version-detail',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@QueryParams() params: ComponentVersionEditReq): Promise<ResData<ContentVersionWithType>> {
    try {
      const versionDetail = await this.service.version.info.getDetail({ id: params.id, deleted: false });

      if (this.notValid(versionDetail)) {
        return Response.warning(i18n.component.invalidVersionId, 2110601);
      }

      const contentDetail = await this.service.content.info.getDetailById(versionDetail.contentId);
      const fileDetail = await this.service.file.info.getDetailById(contentDetail?.id);

      const versionContent = await this.service.component.getComponentResourcePath(versionDetail.content);
      versionDetail.content = versionContent;

      return Response.success(
        Object.assign({ componentType: fileDetail?.componentType || '' }, versionDetail),
        1110601,
      );
    } catch (err) {
      return Response.error(err, i18n.content.getComponentVersionDetailFailed, 3110601);
    }
  }
}
