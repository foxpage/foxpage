export interface PaginationInfo {
  page: number;
  size: number;
  total: number;
}

export interface BaseResponse<P = unknown> {
  code: number;
  data?: P;
  msg?: string;
  status?: number;
}

export interface ResponseBody<P = unknown> extends BaseResponse<P> {}

export interface PaginationReqParams {
  page?: number;
  size?: number;
  search?: string;
}

export interface PaginationResponseBody<P = unknown> extends BaseResponse<P> {
  pageInfo: PaginationInfo;
}

export interface CommonFetchParams extends PaginationReqParams {
  organizationId: string;
  applicationId?: string;
  id?: string;
}

export interface CommonDeleteParams extends Pick<CommonFetchParams, 'applicationId' | 'id'> {
  status: boolean;
}

export interface CommonPublishParams extends Pick<CommonFetchParams, 'applicationId' | 'id'> {
  contentId?: string;
  status: string;
}

export interface OptionsAction<P = unknown> {
  onSuccess?(res?: P): void;
  onFail?(): void;
}

export type CommonSearchType =
  | 'project'
  | 'page_template'
  | 'page'
  | 'template'
  | 'variable'
  | 'condition'
  | 'function'
  | 'project_variable'
  | 'project_condition'
  | 'project_function'
  | 'component'
  | 'content'
  | 'application';

export interface CommonSearchParams extends PaginationReqParams {
  organizationId: string;
  applicationId?: string;
  type: CommonSearchType;
  typeId?: string;
  userType?: string;
}
