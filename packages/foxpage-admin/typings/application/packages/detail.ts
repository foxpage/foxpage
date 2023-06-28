import {
  BaseResponse,
  CommonFetchParams,
  ComponentRemote,
  EditorComponent,
  PaginationReqParams,
} from '@foxpage/foxpage-client-types';

import {
  ComponentsLiveVersionUpdateParams,
  ComponentsVersionPublishParams,
  ComponentsVersionSaveParams,
  ComponentsVersionUpdateParams,
} from './list';

// type api
export type AppComponentDetailFetchComponentInfoParams = Pick<CommonFetchParams, 'applicationId' | 'id'>;

export interface AppComponentDetailFetchComponentVersionsParams {
  page?: number;
  size?: number;
}

export type AppComponentDetailAddComponentVersionParams = Partial<ComponentsVersionSaveParams>;
export type AppComponentDetailEditComponentVersionParams = ComponentsVersionUpdateParams;
export type AppComponentDetailUpdateComponentVersionStatueParams = ComponentsVersionPublishParams;
export type AppComponentDetailLiveComponentVersionParams = ComponentsLiveVersionUpdateParams;

export interface RemoteComponentFetchParams extends Omit<CommonFetchParams, 'organizationId'> {
  groupId: string;
  name?: string;
}

export interface ComponentRemoteSaveParams<T = ComponentRemote> {
  applicationId: string;
  components: T[];
}

export type EditorComponentSaveParams = ComponentRemoteSaveParams<EditorComponent>;

export interface EditorComponentSavedRes extends BaseResponse<Record<string, string>> {}

export interface EditorBatchPublishParams {
  applicationId: string;
  idVersions: { id: string; version?: string }[];
}

export interface ComponentUsedFetchParams extends PaginationReqParams {
  applicationId: string;
  name: string;
  live: boolean;
}

export interface ComponentDisabledSaveParams {
  applicationId: string;
  id: string;
  status: boolean;
}
