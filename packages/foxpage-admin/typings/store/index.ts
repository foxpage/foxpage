import {
  CommonFetchParams,
  PaginationInfo,
  PaginationReqParams,
  ResponseBody,
  StoreProjectResource,
  StoreResourceDetail,
} from '@foxpage/foxpage-client-types';

interface StoreCommonParams extends Pick<StoreResourceDetail, 'applicationId' | 'id' | 'type'> {
  appIds?: string[];
  goodsIds: string[];
}

export type StoreResourceSearchParams = Pick<StoreCommonParams, 'appIds' | 'type'> & PaginationReqParams;
export interface StoreResourceSearchResult extends ResponseBody {
  pageInfo: PaginationInfo;
  data: StoreProjectResource[];
}
export interface GoodsSearchParams extends Omit<CommonFetchParams, 'organizationId'> {
  type: string;
}

export interface GoodsAddParams extends Pick<StoreCommonParams, 'appIds' | 'goodsIds'> {
  delivery: 'clone' | 'reference';
}

export interface GoodsCommitParams extends Pick<StoreCommonParams, 'id' | 'applicationId' | 'type'> {
  intro?: string;
  isOnline?: string;
}

export type GoodsOfflineParams = Pick<StoreCommonParams, 'id' | 'applicationId'>;
