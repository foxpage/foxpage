import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD, TYPE } from '../../../config/constant';
import { VersionWithExternal } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentListRes, AppContentVersionReq } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('variables')
export class GetVariableList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the live version details of the variable specified under the application
   * @param  {AppContentVersionReq} params
   * @returns {PageContentData[]}
   */
  @Post('/lives')
  @OpenAPI({
    summary: i18n.sw.getAppVariables,
    description: '',
    tags: ['Variable'],
    operationId: 'get-variable-live-version-list',
  })
  @ResponseSchema(AppContentListRes)
  async index (@Ctx() ctx: FoxCtx, @Body() params: AppContentVersionReq): Promise<ResData<VersionWithExternal[]>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.GET });
      const [pageList, contentList] = await Promise.all([
        this.service.content.live.getContentLiveDetails({
          applicationId: params.applicationId,
          type: TYPE.VARIABLE as FileTypes,
          contentIds: params.ids || [],
        }),
        this.service.content.list.getDetailByIds(params.ids),
      ]);

      let pageVersions: VersionWithExternal[] = [];
      const contentObject = _.keyBy(contentList, 'id');
      pageList.forEach(item => {
        pageVersions.push(Object.assign(
          {},
          item.content || {},
          {
            name: contentObject[item.contentId]?.title || '',
            version: item.version || '',
            versionNumber: this.service.version.number.createNumberFromVersion(item.version || '0.0.1'),
            fileId: contentObject[item.contentId]?.fileId || '',
          }
        ));
      });

      return Response.success(pageVersions, 1080601);
    } catch (err) {
      return Response.error(err, i18n.variable.getAppVariableFailed, 3080601);
    }
  }
}
