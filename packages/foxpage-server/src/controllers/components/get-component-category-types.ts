import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { ComponentCategoryTypes }from '../../types/component-types';
import { ResData } from '../../types/index-types';
import { AppIDReq } from '../../types/validates/app-validate-types';
import { ComponentCategoryTypesRes } from '../../types/validates/component-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('components')
export class GetComponentCategoryTypes extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the application's component category types
   * @param  {AppIDReq} params
   * @returns {Content}
   */
  @Get('/category-types')
  @OpenAPI({
    summary: i18n.sw.getComponentsCategoryTypes,
    description: '',
    tags: ['Component'],
    operationId: 'get-components-category-types',
  })
  @ResponseSchema(ComponentCategoryTypesRes)
  async index(@QueryParams() params: AppIDReq): Promise<ResData<ComponentCategoryTypes[]>> {

    try {
      const appDetail = await this.service.application.getDetailById(params.applicationId);
      const componentSetting = appDetail?.setting?.component || [];

      let categoryTypeObject: Record<string, any> = {};
      componentSetting.forEach(item => {
        const categoryType = item.category || {};
        const { categoryName = '', groupName = '' } = categoryType;
        if (!categoryTypeObject[categoryName]) {
          categoryTypeObject[categoryName] = { categoryName, groupNames: [] };
        }

        if (categoryTypeObject[categoryName].groupNames.indexOf(groupName) === -1) {
          categoryTypeObject[categoryName].groupNames.push(groupName);
        }
      });

      return Response.success(_.sortBy(_.toArray(categoryTypeObject), ['categoryName', 'groupNames']), 1112601);
    } catch (err) {
      return Response.error(err, i18n.component.getComponentsCategoryTypeFailed, 3112601);
    }
  }
}
