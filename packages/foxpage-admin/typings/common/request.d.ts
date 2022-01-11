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

export interface ResponseBody<P = unknown> extends BaseResponse<P> {
  pageInfo?: PaginationInfo;
}

export interface PaginationReqParams {
  page?: number;
  size?: number;
  search?: string;
}
