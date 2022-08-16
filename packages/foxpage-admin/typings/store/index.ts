import { FileType } from '@/constants/index';
import {
  AbstractEntity,
  Application,
  CommonFetchParams,
  ContentEntity,
  PaginationInfo,
  PaginationReqParams,
  ResponseBody,
} from '@/types/index';

export interface StoreResource extends Pick<AbstractEntity, 'id' | 'createTime' | 'creator' | 'updateTime'> {
  application: Pick<Application, 'id' | 'name'>;
  checked?: boolean;
  intro: string;
  name: string;
}

interface StoreResourceDetail extends Pick<StoreResource, 'id'> {
  applicationId: string;
  projectId: string;
  type: string;
}

export interface StoreFileResource extends Pick<StoreResource, 'id' | 'name'> {
  details: StoreResourceDetail;
  type: FileType;
  contents?: ContentEntity[];
}

export interface StoreProjectResource extends StoreResource {
  files: Array<StoreFileResource>;
}

export interface StorePackageResource extends StoreResource {
  details: StoreResourceDetail;
}

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
