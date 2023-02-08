import 'reflect-metadata';

import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { ContentVersionInfo } from '../../types/content-types';
import { ResData } from '../../types/index-types';
import { ContentVersionDetailRes, ContentVersionListReq } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

/**
 *
 * @export
 * @class GetVersionList
 * @extends {BaseController}
 */
@JsonController('resources')
export class GetResourceVersionList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the version list of the page
   * @param  {ContentVersionListReq} params
   * @returns {ContentVersionInfo}
   */
  @Get('/versions')
  @OpenAPI({
    summary: i18n.sw.getResourceVersionList,
    description: '',
    tags: ['Resource'],
    operationId: 'get-resource-version-list',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@QueryParams() params: ContentVersionListReq): Promise<ResData<ContentVersionInfo[]>> {
    try {
      // Check the validity of the page
      const contentDetail = await this.service.content.info.getDetailById(params.id);
      if (this.notValid(contentDetail)) {
        return Response.warning(i18n.content.invalidContentId, 2121301);
      }

      // Get a list of all valid versions
      const versionList = await this.service.version.list.getVersionList({ contentId: params.id });

      return Response.success(versionList, 1121301);
    } catch (err) {
      return Response.error(err, i18n.content.getContentVersionListFailed, 3121301);
    }
  }
}
