import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { TAG } from '../../../config/constant';
import { ContentVersionWithLive } from '../../types/content-types';
import { PageData, ResData } from '../../types/index-types';
import { AppComponentVersionListReq } from '../../types/validates/component-validate-types';
import { FileListRes } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('components')
export class GetComponentPageVersionList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the paging list of components under the application
   * @param  {AppPageListCommonReq} params
   * @returns {FileUserInfo}
   */
  @Get('/version-searchs')
  @OpenAPI({
    summary: i18n.sw.getComponentPageVersionList,
    description: '',
    tags: ['Component'],
    operationId: 'get-component-page-version-list',
  })
  @ResponseSchema(FileListRes)
  async index(
    @QueryParams() params: AppComponentVersionListReq,
  ): Promise<ResData<PageData<ContentVersionWithLive>>> {
    try {
      this.service.content.info.setPageSize(params);

      let fileId = params.id;
      let liveVersionId = '';

      // Check if file is a reference component
      const fileDetail = await this.service.file.info.getDetailById(fileId);
      const referenceTag = _.find(fileDetail.tags || [], { type: TAG.DELIVERY_REFERENCE });
      if (referenceTag && !_.isEmpty(referenceTag)) {
        fileId = referenceTag.reference?.id;
        liveVersionId = referenceTag.reference?.liveVersionId || '';
      }

      // Get the content ID under the file
      const contentDetail = await this.service.content.info.getDetail({ fileId, deleted: false });
      if (this.notValid(contentDetail)) {
        return Response.warning(i18n.component.invalidFileId, 2110901);
      }

      const versionList = await this.service.version.list.getVersionList({
        contentId: contentDetail.id,
        deleted: false,
      });

      const versionContents = _.map(versionList, (version) => version.content);
      const componentIds = this.service.content.component.getComponentResourceIds(versionContents);
      const [resourceObject, contentAllParents] = await Promise.all([
        this.service.content.resource.getResourceContentByIds(componentIds),
        this.service.content.list.getContentAllParents(componentIds),
      ]);

      const appResource = await this.service.application.getAppResourceFromContent(contentAllParents);
      const contentResource = this.service.content.info.getContentResourceTypeInfo(
        appResource,
        contentAllParents,
      );

      let contentVersionList: ContentVersionWithLive[] = [];
      for (const version of versionList) {
        version.content.resource = this.service.version.component.assignResourceToComponent(
          version?.content?.resource || {},
          resourceObject,
          { contentResource },
        );

        contentVersionList.push(
          Object.assign(
            {
              isLiveVersion: version.id === (liveVersionId || contentDetail.liveVersionId),
            },
            _.omit(version, ['operator', 'contentUpdateTime']),
          ),
        );
      }

      return Response.success(
        {
          data: _.chunk(contentVersionList, params.size)[params.page - 1] || [],
          pageInfo: {
            page: params.page,
            size: params.size,
            total: contentVersionList.length,
          },
        },
        1110901,
      );
    } catch (err) {
      return Response.error(err, i18n.component.getComponentPageVersionListFailed, 3110901);
    }
  }
}
