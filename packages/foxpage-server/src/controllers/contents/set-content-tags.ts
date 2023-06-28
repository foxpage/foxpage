import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

// import { Content } from '@foxpage/foxpage-server-types';
import { i18n } from '../../../app.config';
// import { VERSION } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { ContentDetailRes, SetContentTagsReq } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('contents')
export class SetContentTags extends BaseController {
  constructor() {
    super();
  }

  /**
   * set content tags, tag with type field can be update or add
   * the same type has only one tag info
   * @param  {ContentLiveReq} params
   * @returns {Content}
   */
  @Put('/tags')
  @OpenAPI({
    summary: i18n.sw.setContentTags,
    description: '',
    tags: ['Content'],
    operationId: 'set-content-tags',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: SetContentTagsReq): Promise<ResData<string>> {
    const { applicationId = '', id = '', tags = [] } = params;
    try {
      const [hasAuth, contentDetail] = await Promise.all([
        this.service.auth.content(id, { ctx }),
        this.service.content.info.getDetailById(id),
      ]);

      if (this.notValid(contentDetail) || contentDetail.applicationId !== applicationId) {
        return Response.warning(i18n.content.invalidContentId, 2162601);
      }

      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4162601);
      }

      if (tags.length === 0) {
        return Response.warning(i18n.content.invalidTags, 2162602);
      } else {
        // check tag has type fields
        const invalidTags = _.filter(tags, (tag) => _.isNil(tag.type));
        if (invalidTags.length > 0) {
          return Response.warning(i18n.content.tagWithoutType, 2162603);
        }

        const typeValues = _.map(tags, 'type');
        const contentTags = contentDetail.tags || [];
        _.remove(contentTags, (tag) => typeValues.indexOf(tag.type) !== -1);
        await this.service.content.info.updateDetail(id, { tags: contentTags.concat(tags) });
      }

      return Response.success(i18n.content.saveTagsSuccess, 1162601);
    } catch (err) {
      return Response.error(err, i18n.content.saveTagsFailed, 3162601);
    }
  }
}
