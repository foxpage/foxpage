import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Application, AppResource } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG, PRE, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppDetailRes, UpdateAppReq } from '../../types/validates/app-validate-types';
import * as Response from '../../utils/response';
import { generationId } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('applications')
export class UpdateApplicationDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update application details, only application name, introduction and locales can be updated
   * @param  {UpdateAppReq} params
   * @returns Application
   */
  @Put('')
  @OpenAPI({
    summary: i18n.sw.updateAppDetail,
    description: '',
    tags: ['Application'],
    operationId: 'update-application-detail',
  })
  @ResponseSchema(AppDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateAppReq): Promise<ResData<Application>> {
    try {
      // Check the validity of the application
      let appDetail = await this.service.application.getDetailById(params.applicationId);
      if (!appDetail || appDetail.deleted) {
        return Response.warning(i18n.app.invalidAppId, 2031001);
      }

      // Permission check
      const hasAuth = await this.service.auth.application(params.applicationId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4031001);
      }

      // Check whether the updated application slug already exists
      if (params.slug && params.slug !== appDetail.slug) {
        const organizationId = appDetail.organizationId;
        const duplicationAppDetail = await this.service.application.getDetail({
          organizationId,
          slug: params.slug,
          deleted: false,
        });

        if (!_.isEmpty(duplicationAppDetail) && !duplicationAppDetail.deleted) {
          return Response.warning(i18n.app.appSlugExist, 2031002);
        }
      }

      // Update application information, only allow the specified fields to be updated
      const appInfo = _.pick(params, ['name', 'intro', 'host', 'slug', 'locales', 'resources']);

      // Check the validity of the updated resources
      if (appInfo.resources && appInfo.resources.length > 0) {
        const checkResult = this.service.application.checkAppResourceUpdate(
          appDetail.resources || [],
          appInfo.resources as AppResource[],
        );

        if (checkResult.code === 1) {
          return Response.warning(i18n.app.resourceUnDeleted + ':' + checkResult.data.join(','), 2031003);
        } else if (checkResult.code === 2) {
          return Response.warning(i18n.app.resourceDuplication + ':' + checkResult.data.join(','), 2031004);
        } else if (checkResult.code === 3) {
          return Response.warning(
            i18n.app.resourceTypeUnEditable + ':' + checkResult.data.join(','),
            2031005,
          );
        } else if (checkResult.code === 4) {
          return Response.warning(i18n.app.invalidResourceIds + ':' + checkResult.data.join(','), 2031006);
        }

        appInfo.resources.forEach((resource) => {
          resource.id = resource.id || generationId(PRE.RESOURCE);
        });
      }
      await this.service.application.updateDetail(params.applicationId, appInfo);
      const newAppDetail = await this.service.application.getDetailById(params.applicationId);

      // Save logs
      ctx.logAttr = Object.assign(ctx.logAttr, { id: params.applicationId, type: TYPE.APPLICATION });
      this.service.userLog.addLogItem(appDetail, {
        ctx,
        actions: [LOG.UPDATE, '', TYPE.APPLICATION],
        category: { applicationId: appDetail.id },
      });

      return Response.success(newAppDetail, 1031001);
    } catch (err) {
      return Response.error(err, i18n.app.updateDetailFailed, 3031001);
    }
  }
}
