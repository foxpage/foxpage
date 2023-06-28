import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TAG, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { UpdateComponentReq } from '../../types/validates/component-validate-types';
import { FileDetailRes } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('components')
export class UpdateComponentFileDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update component file information, currently only the file profile can be updated
   * @param  {UpdateComponentReq} params
   * @returns {ContentVersion}
   */
  @Put('')
  @OpenAPI({
    summary: i18n.sw.updateComponentFileDetail,
    description: '',
    tags: ['Component'],
    operationId: 'update-component-file-detail',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateComponentReq): Promise<ResData<File>> {
    try {
      // Permission check
      const hasAuth = await this.service.auth.file(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4112001);
      }

      // set component tags
      const [componentFileDetail, fileContentList] = await Promise.all([
        this.service.file.info.getDetailById(params.id),
        this.service.content.file.getContentByFileIds([params.id]),
      ]);

      const componentTags = componentFileDetail.tags || [];
      if (!_.isNil(params.loadOnIgnite)) {
        const referenceIndex = _.findIndex(componentTags, (tag) => tag.type === TAG.DELIVERY_REFERENCE);
        if (
          referenceIndex === -1 &&
          (fileContentList.length === 0 || fileContentList[0].liveVersionId === '')
        ) {
          return Response.warning(i18n.component.mustHaveLiveVersion, 2112002);
        }

        _.remove(componentTags, (item) => item.type === TAG.LOAD_ON_IGNITE);
        componentTags.push({ type: TAG.LOAD_ON_IGNITE, status: params.loadOnIgnite || false });
      }

      const result = await this.service.file.info.updateFileDetail(
        Object.assign({}, _.omit(params, ['loadOnIgnite']), { tags: componentTags }),
        { ctx, actionDataType: componentFileDetail.type || '' },
      );
      if (result.code === 1) {
        return Response.warning(i18n.component.invalidFileId, 2112001);
      }

      await this.service.file.info.runTransaction(ctx.transactions);
      const fileDetail = await this.service.file.info.getDetailById(params.id);

      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.COMPONENT });

      return Response.success(fileDetail, 1112001);
    } catch (err) {
      return Response.error(err, i18n.component.updateComponentFileFailed, 3112001);
    }
  }
}
