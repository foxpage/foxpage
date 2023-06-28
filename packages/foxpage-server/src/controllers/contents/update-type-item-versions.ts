import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { ACTION, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import {
  ContentVersionDetailRes,
  ContentVersionUpdateReq,
} from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController()
export class UpdateTypeItemVersionDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update type item [variable|condition|function|mock|...]
   * content version information, including version number and content
   * @param  {ContentVersionUpdateReq} params
   * @returns {ContentVersion}
   */
  @Put('variables/versions')
  @Put('conditions/versions')
  @Put('functions/versions')
  @Put('mocks/versions')
  @OpenAPI({
    summary: i18n.sw.updateVariableVersionDetail,
    description: '',
    tags: ['Content'],
    operationId: 'update-type-item-version-detail',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: ContentVersionUpdateReq): Promise<ResData<ContentVersion>> {
    try {
      const apiType = this.getRoutePath(ctx.request.url);

      const [hasAuth, contentDetail] = await Promise.all([
        this.service.auth.content(params.pageContentId || params.id, { ctx }),
        this.service.content.info.getDetailById(params.id),
      ]);

      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4162301);
      }

      if (
        this.notValid(contentDetail) ||
        contentDetail.applicationId !== params.applicationId ||
        contentDetail.type !== apiType
      ) {
        return Response.warning(i18n.content.invalidVersionId, 2162304);
      }

      // format mock schema props value
      if (apiType === TYPE.MOCK && params.content?.schemas) {
        params.content.schemas = this.service.version.info.formatMockValue(
          params.content.schemas,
          ACTION.SAVE,
        );
      }

      const result = await this.service.version.info.updateVersionDetail(params, {
        ctx,
        actionDataType: apiType,
      });

      if (result.code === 1) {
        return Response.warning(i18n.content.invalidVersionId, 2162301);
      } else if (result.code === 2) {
        return Response.warning(i18n.content.unEditedStatus, 2162302);
      } else if (result.code === 3) {
        return Response.warning(i18n.content.versionExist, 2162303);
      } else if (result.code === 4) {
        return Response.warning(
          i18n.content.missingFields + (<string[]>result.data || []).join(','),
          2162305,
        );
      } else if (result.code === 5 && apiType === TYPE.CONDITION) {
        return Response.warning(
          i18n.condition.invalidRelations + (<string[]>result.data || []).join(','),
          2162306,
        );
      }

      await this.service.version.info.runTransaction(ctx.transactions);
      const versionDetail = await this.service.version.info.getDetailById(<string>result.data);

      ctx.logAttr = Object.assign(ctx.logAttr, { id: versionDetail.id, type: apiType });

      return Response.success(versionDetail, 1162301);
    } catch (err) {
      return Response.error(err, i18n.variable.updateVariableVersionFailed, 3162301);
    }
  }
}
