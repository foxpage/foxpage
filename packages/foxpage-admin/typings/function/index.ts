import {
  CommonDeleteParams,
  CommonFetchParams,
  CommonPublishParams,
  FileScope,
  FuncContentEntity,
  FuncDeleteData,
  FuncEntity,
  FuncNewData,
  PaginationInfo,
  ResponseBody,
} from '@foxpage/foxpage-client-types';

export interface FuncFetchParams extends Omit<CommonFetchParams, 'organizationId'> {
  folderId?: string;
  type?: string;
  scope?: FileScope;
}

export interface FuncFetchRes extends ResponseBody {
  data: FuncEntity[];
  pageInfo: PaginationInfo;
}

// FuncNewParams
export interface FuncSaveParams extends Pick<FuncFetchParams, 'applicationId' | 'folderId' | 'type'> {
  name?: string;
  id?: string;
  intro?: string;
  suffix?: string;
  content?: FuncContentEntity;
  pageContentId?: string;
}

export interface FuncNewRes extends ResponseBody {
  data: FuncNewData;
}

export interface FuncUpdateParams
  extends Pick<FuncSaveParams, 'applicationId' | 'content' | 'intro' | 'name' | 'type'> {
  id: string;
}

export interface FuncUpdateRes extends ResponseBody {
  data: FuncNewData;
}

export type FuncDeleteParams = CommonDeleteParams & {
  fun?: FuncEntity;
};

export interface FuncDeleteRes extends ResponseBody {
  data: FuncDeleteData[];
}

export type FuncPublishParams = CommonPublishParams;
