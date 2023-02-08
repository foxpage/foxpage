import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { ACTION, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentListRes, PageBuildVersionReq } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('')
export class GetTypeItemBuildDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the build details of the specified type content
   * @param  {PageBuildVersionReq} params
   * @returns {PageContentData[]}
   */
  @Get('variables/build-versions')
  @Get('conditions/build-versions')
  @Get('functions/build-versions')
  @Get('mocks/build-versions')
  @OpenAPI({
    summary: i18n.sw.getConditionBuildDetail,
    description: '',
    tags: ['Condition'],
    operationId: 'get-condition-build-version',
  })
  @ResponseSchema(AppContentListRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @QueryParams() params: PageBuildVersionReq,
  ): Promise<ResData<ContentVersion>> {
    try {
      const apiType = this.getRoutePath(ctx.request.url);

      const [contentDetail, versionNumber] = await Promise.all([
        this.service.content.info.getDetailById(params.id),
        this.service.version.number.getLatestVersionNumber(params.id),
      ]);

      // content is invalid or the params id's type is invalid
      if (this.notValid(contentDetail) || contentDetail.type !== apiType) {
        return Response.success({}, 1161601);
      }

      const contentVersion = await this.service.version.info.getDetail({
        contentId: params.id,
        versionNumber,
      });

      // Get [variable,condition, mock] relation information
      let relations: Record<string, any[]> = {};
      if (
        [TYPE.VARIABLE, TYPE.CONDITION, TYPE.MOCK].indexOf(apiType) !== -1 &&
        contentVersion?.content?.relation
      ) {
        const relationObject = await this.service.version.relation.getVersionRelations(
          { [contentVersion.contentId]: contentVersion },
          false,
        );

        // format mock props value
        if (apiType === TYPE.MOCK) {
          contentVersion.content.schemas = this.service.version.info.formatMockValue(
            contentVersion.content?.schemas,
            ACTION.GET,
          );
        }

        relations = await this.service.relation.formatRelationResponse(relationObject);
      }

      return Response.success(Object.assign({ relations: relations }, contentVersion || {}), 1161602);
    } catch (err) {
      return Response.error(err, i18n.condition.getAppConditionFailed, 3161601);
    }
  }
}
