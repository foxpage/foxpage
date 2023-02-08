import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { ResData } from '../../types/index-types';
import { AppContentId } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('content')
export class GetContentList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the content all versions base info list, include id, version, creator
   * @param  {AppContentId} params
   * @returns {ContentInfo}
   */
  @Get('/versions')
  @OpenAPI({
    summary: i18n.sw.contentList,
    description: '',
    tags: ['Content'],
    operationId: 'content-version-base-list',
  })
  async index(@QueryParams() params: AppContentId): Promise<ResData<Record<string, any>[]>> {
    try {
      const contentDetail = await this.service.content.info.getDetailById(params.id);
      if (this.notValid(contentDetail) || contentDetail.applicationId !== params.applicationId) {
        return Response.warning(i18n.content.invalidContentId, 2161501);
      }

      const versionList = await this.service.version.list.find({ contentId: params.id, deleted: false });
      const userObject = await this.service.user.getUserBaseObjectByIds(_.map(versionList, 'creator'));

      return Response.success(
        _.map(versionList, (version) =>
          Object.assign(_.pick(version, ['id', 'contentId', 'version', 'createTime']), {
            creator: userObject[version.creator],
          }),
        ),
        1161501,
      );
    } catch (err) {
      return Response.error(err, i18n.content.getContentVersionsFailed, 3161501);
    }
  }
}
