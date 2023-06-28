import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG, METHOD, TAG, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentStatusReq } from '../../types/validates/content-validate-types';
import { FileDetailRes } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('components')
export class SetComponentFileStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the deletion status of component files
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('/status')
  @OpenAPI({
    summary: i18n.sw.setComponentFileStatus,
    description: '',
    tags: ['Component'],
    operationId: 'set-component-file-status',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentStatusReq): Promise<ResData<File>> {
    params.status = true; // Currently it is mandatory to only allow delete operations

    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.DELETE, type: TYPE.COMPONENT });

      // Permission check
      const hasAuth = await this.service.auth.file(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4111401);
      }

      // check the component's status in store
      // check reference component status
      const [fileStoreDetail, componentDetail, referenceComponents] = await Promise.all([
        this.service.store.goods.getDetail({ 'detail.id': params.id, deleted: false }),
        this.service.file.info.getDetailById(params.id),
        this.service.file.list.find({
          tags: { $elemMatch: { type: TAG.DELIVERY_REFERENCE, 'reference.id': params.id } },
          type: TYPE.COMPONENT,
          deleted: false,
        }),
      ]);

      if (this.notValid(componentDetail)) {
        return Response.warning(i18n.component.invalidComponentIdOrAppId, 2111405);
      }

      const deprecatedTag = _.find(componentDetail.tags, (tag) => tag.type === TAG.DEPRECATED);
      if (!deprecatedTag?.status) {
        return Response.warning(i18n.component.mustDeprecatedFirst, 2111406);
      } else if (fileStoreDetail && fileStoreDetail.status === 1) {
        return Response.warning(i18n.component.componentInStore, 2111401);
      } else if (referenceComponents.length > 0) {
        return Response.warning(i18n.component.existReferences, 2111404);
      }

      const result = await this.service.file.info.setFileDeleteStatus(params, {
        ctx,
        actionType: [LOG.DELETE, TYPE.COMPONENT].join('_'),
      });
      if (result.code === 1) {
        return Response.warning(i18n.file.invalidFileId, 2111402);
      } else if (result.code === 2) {
        return Response.warning(i18n.component.fileCannotBeDeleted, 2111403);
      }

      await this.service.file.info.runTransaction(ctx.transactions);
      const fileDetail = await this.service.file.info.getDetailById(params.id);

      return Response.success(fileDetail, 1111401);
    } catch (err) {
      return Response.error(err, i18n.component.setComponentFileDeletedFailed, 3111401);
    }
  }
}
