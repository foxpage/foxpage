export interface PaginationInfo {
  page: number;
  size: number;
  total: number;
}

export interface BaseResponse<P = unknown> {
  code: number;
  data?: P;
  msg?: string;
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
