import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { ContentVersionWithLive } from '../../types/content-types';
import { ResData } from '../../types/index-types';
import { ComponentFileVersionReq } from '../../types/validates/component-validate-types';
import { ContentVersionDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

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
  @Get('/versions')
  @OpenAPI({
    summary: i18n.sw.getComponentVersionDetail,
    description: '/component/version/detail',
    tags: ['Component'],
    operationId: 'get-component-version-detail',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@QueryParams() params: ComponentFileVersionReq): Promise<ResData<ContentVersionWithLive>> {
    try {
      const contentDetail = await this.service.content.info.getDetail({ fileId: params.id, deleted: false });
      if (this.notValid(contentDetail)) {
        return Response.warning(i18n.component.invalidFileId, 2111001);
      }

      const versionDetail = await this.service.version.info.getDetail({
        contentId: contentDetail.id,
        versionNumber: params.versionNumber,
        deleted: false,
      });

      // Get the resource information corresponding to the component
      const componentIds = this.service.content.component.getComponentResourceIds([versionDetail?.content]);
      const [resourceObject, contentAllParents] = await Promise.all([
        this.service.content.resource.getResourceContentByIds(componentIds),
        this.service.content.list.getContentAllParents(componentIds),
      ]);

      const appResource = await this.service.application.getAppResourceFromContent(contentAllParents);
      const contentResource = this.service.content.info.getContentResourceTypeInfo(
        appResource,
        contentAllParents,
      );

      if (versionDetail?.content?.resource) {
        versionDetail.content.resource = this.service.version.component.assignResourceToComponent(
          versionDetail.content.resource,
          resourceObject,
          { contentResource },
        );
      }

      return Response.success(
        versionDetail
          ? Object.assign(
              {
                isLiveVersion: versionDetail.versionNumber === contentDetail.liveVersionNumber,
              },
              _.omit(versionDetail, ['operator', 'contentUpdateTime']),
            )
          : {},
        1111001,
      );
    } catch (err) {
      return Response.error(err, i18n.content.getComponentVersionDetailFailed, 3111001);
    }
  }
}
