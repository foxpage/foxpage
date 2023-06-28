import {
  ApplicationResourceGroupEntity,
  BaseResponse,
  CommonDeleteParams,
  CommonFetchParams,
  ComponentRemote,
  RemoteResource,
  RemoteResourceSavedData,
} from '@foxpage/foxpage-client-types';

export type ApplicationResourcesAllGroupsFetchParams = Omit<CommonFetchParams, 'id' | 'organizationId'>;

export interface ApplicationResourcesGroupSaveParams
  extends Pick<ApplicationResourceGroupEntity, 'applicationId' | 'name' | 'intro'> {
  id?: string;
  resourceId: string;
  resourceType?: string | number;
  config?: {
    resourceScope: string;
  };
}

export type ApplicationResourcesGroupDeleteParams = CommonDeleteParams;

export interface ApplicationResourcesRemoteUrlFetchParams
  extends Partial<Pick<ApplicationResourcesGroupSaveParams, 'applicationId' | 'resourceType'>> {
  resourceScope?: string;
}

export interface RemoteResourceSaveParams {
  applicationId: string;
  id: string;
  resources: RemoteResource[];
}

export interface UpdateComponentRemoteInfoParams {
  name: string;
  info: Partial<ComponentRemote>;
}

export interface RemoteResourceSavedRes extends BaseResponse<RemoteResourceSavedData> {}

// SaveResourcesGroupsRequestParams
export interface ResourcesGroupConfigUpdateParams
  extends Partial<Pick<ApplicationResourceGroupEntity, 'id' | 'applicationId' | 'name' | 'intro' | 'tags'>> {
  config?: {
    manifestPath: string;
  };
}

export type AppResourcesGroupsDeleteResourcesGroupParams = {
  appId: string;
  id: string;
};

export interface ResourceUrlFetchedRes extends BaseResponse {
  url?: string;
}
