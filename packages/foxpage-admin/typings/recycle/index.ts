import {
  CommonFetchParams,
  PaginationInfo,
  ProjectEntity,
  ResponseBody,
} from '@foxpage/foxpage-client-types';

export type RecycleFetchParams = CommonFetchParams;

export interface RecycleFetchResponse extends ResponseBody {
  pageInfo: PaginationInfo;
  data: ProjectEntity[];
}
