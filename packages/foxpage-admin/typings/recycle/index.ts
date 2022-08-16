import { CommonFetchParams, PaginationInfo, ProjectEntity, ResponseBody } from '@/types/index';

export type RecycleFetchParams = CommonFetchParams;

export interface RecycleFetchResponse extends ResponseBody {
  pageInfo: PaginationInfo;
  data: ProjectEntity[];
}
