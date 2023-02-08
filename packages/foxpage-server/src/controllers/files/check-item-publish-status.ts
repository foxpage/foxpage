import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { ResData } from '../../types/index-types';
import { CheckVersionPublishReq } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('versions')
export class CheckItemVersionPublishStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Check version data can be published
   * if version id is not pass, then get the content's max base version to check
   * @param  {CheckVersionPublishReq} params
   * @returns {Record<string, any>}
   */
  @Get('/publish-check')
  @OpenAPI({
    summary: i18n.sw.checkVersionPublishStatus,
    description: '',
    tags: ['File'],
    operationId: 'check-item-version-publish-status',
  })
  async index(@QueryParams() params: CheckVersionPublishReq): Promise<ResData<Record<string, any>>> {
    try {
      if (!params.contentId && !params.versionId) {
        return Response.warning(i18n.file.invalidItemId, 2171101);
      }

      if (!params.versionId) {
        const versionDetail = await this.service.version.info.getMaxBaseContentVersionDetail(
          params.contentId,
        );
        if (this.notValid(versionDetail)) {
          return Response.warning(i18n.file.invalidItemId, 2171102);
        }
        params.versionId = versionDetail.id;
      }

      const validateResult = await this.service.version.check.versionCanPublish(params.versionId);

      return Response.success(validateResult, 1171101);
    } catch (err) {
      return Response.error(err, i18n.file.listError, 3171101);
    }
  }
}
