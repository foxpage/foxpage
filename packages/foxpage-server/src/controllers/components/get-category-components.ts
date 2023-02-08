import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { TAG } from '../../../config/constant';
import { ComponentWithCategory }from '../../types/component-types';
import { ResData } from '../../types/index-types';
import { GetCategoryComponentReq } from '../../types/validates/component-validate-types';
import { FileDetailRes } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('components')
export class GetCategoryComponents extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get had set category's components in application
   * @param  {GetCategoryComponentReq} params
   * @returns {Content}
   */
  @Get('/category')
  @OpenAPI({
    summary: i18n.sw.getCategoryComponents,
    description: '',
    tags: ['Component'],
    operationId: 'get-category-components',
  })
  @ResponseSchema(FileDetailRes)
  async index(@QueryParams() params: GetCategoryComponentReq): Promise<ResData<ComponentWithCategory>> {

    try {
      this.service.folder.info.setPageSize(params);

      const componentPageData = await this.service.component.getPageCategoryComponents(params);
      let componentCategory: ComponentWithCategory[] = [];
      if (componentPageData.list && componentPageData.list.length > 0) {
        componentPageData.list.forEach(component => {
          componentCategory.push(
            Object.assign(
              {}, 
              component, 
              { category: _.find(component.tags || [], { type: TAG.COMPONENT_CATEGORY }) || {} }
            )
          );
        });
      }

      return Response.success(
        {
          data: componentCategory,
          pageInfo: {
            page: params.page,
            size: params.size,
            total: componentPageData.count,
          },
        }, 
        1112501,
      );
    } catch (err) {
      return Response.error(err, i18n.component.getCategoryComponentsFailed, 3112501);
    }
  }
}
