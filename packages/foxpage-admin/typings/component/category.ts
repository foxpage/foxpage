import {
  ApplicationSettingBuilderComponent,
  BaseResponse,
  CategoryType,
  ComponentCategory,
  PaginationReqParams,
  PaginationResponseBody,
} from '@foxpage/foxpage-client-types';

export interface ComponentCategoryFetchParams extends PaginationReqParams {
  applicationId: string;
}

export interface ComponentCategoryFetchRes
  extends PaginationResponseBody<ApplicationSettingBuilderComponent[]> {}

export interface CategoryTypeFetchRes extends BaseResponse<CategoryType[]> {}

export interface ComponentCategorySaveParams {
  applicationId: string;
  id: string;
  category: ComponentCategory;
}
