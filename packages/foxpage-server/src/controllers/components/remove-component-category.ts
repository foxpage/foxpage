import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Delete, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { TAG, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { DeleteComponentCategoryReq } from '../../types/validates/component-validate-types';
import { FileDetailRes } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('components')
export class RemoveComponentCategory extends BaseController {
  constructor() {
    super();
  }

  /**
   * Delete component category
   * @param  {AppIDReq} params
   * @returns {Content}
   */
  @Delete('/category')
  @OpenAPI({
    summary: i18n.sw.removeComponentsCategory,
    description: '',
    tags: ['Component'],
    operationId: 'remove-components-category',
  })
  @ResponseSchema(FileDetailRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @QueryParams() params: DeleteComponentCategoryReq,
  ): Promise<ResData<FileDetailRes>> {
    try {
      const hasAuth = await this.service.auth.application(params.applicationId, { ctx, mask: 1 });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4112701);
      }

      // Validate component file
      const fileDetail = await this.service.file.info.getDetailById(params.id);
      if (this.notValid(fileDetail) || fileDetail.type !== TYPE.COMPONENT) {
        return Response.warning(i18n.component.invalidFileId, 2112701);
      }

      const fileTags = _.reject(fileDetail.tags, { type: TAG.COMPONENT_CATEGORY });
      await this.service.file.info.updateDetail(params.id, { tags: fileTags });

      return Response.success(Object.assign({}, fileDetail, { tags: fileTags }), 1112701);
    } catch (err) {
      return Response.error(err, i18n.component.removeComponentsCategoryFailed, 3112701);
    }
  }
}
