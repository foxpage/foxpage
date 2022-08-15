import { ApplicationSettingBuilderComponent } from '../application';
import { BaseResponse, PaginationReqParams, PaginationResponseBody } from '../common';

export interface ComponentCategory {
  type?: string;
  name: string;
  categoryName: string;
  groupName: string;
  sort: number;
  rank: number;
  props: {};
  description: string;
  screenshot: string;
}

export interface CategoryType {
  categoryName: string;
  groupNames: string[];
}

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
