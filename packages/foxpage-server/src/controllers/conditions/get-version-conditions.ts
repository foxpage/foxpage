import 'reflect-metadata';

import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { ContentVersionWithLive } from '../../types/content-types';
import { ResData } from '../../types/index-types';
import {
  ContentVersionDetailRes,
  PageContentVersionDetailReq,
} from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('conditions')
export class GetVersionDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get details of the version specified by the condition
   * @param  {PageContentVersionDetailReq} params
   * @returns {ContentVersion}
   */
  @Get('/versions')
  @OpenAPI({
    summary: i18n.sw.getConditionVersionDetail,
    description: '',
    tags: ['Condition'],
    operationId: 'get-condition-version-detail',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@QueryParams() params: PageContentVersionDetailReq): Promise<ResData<ContentVersionWithLive>> {
    try {
      if (!params.contentId) {
        return Response.warning(i18n.content.invalidVersionIdOrVersion, 2100601);
      }

      params.versionNumber = params.versionNumber;
      const versionDetail: ContentVersionWithLive = await this.service.version.info.getContentVersionDetail(
        params,
      );

      versionDetail.isLiveVersion = false;

      // Add isLive field
      if (versionDetail) {
        const contentDetail = await this.service.content.info.getDetailById(versionDetail.contentId);
        versionDetail.isLiveVersion = contentDetail.liveVersionNumber === versionDetail.versionNumber;
      }

      return Response.success(versionDetail, 1100601);
    } catch (err) {
      return Response.error(err, i18n.content.getConditionVersionDetailFailed, 3100601);
    }
  }
}
