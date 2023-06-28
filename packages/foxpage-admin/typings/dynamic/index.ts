import {
  CommonFetchParams,
  DynamicEntity,
  PaginationInfo,
  ResponseBody,
} from '@foxpage/foxpage-client-types';

export interface DynamicFetchParams extends CommonFetchParams {}

export interface DynamicFetchResponse extends ResponseBody {
  pageInfo: PaginationInfo;
  data: DynamicEntity[];
}
