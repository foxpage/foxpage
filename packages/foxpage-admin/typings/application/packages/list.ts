import {
  CommonFetchParams,
  ComponentType,
  ComponentVersionEntity,
  PackageType,
  PaginationReqParams,
} from '@foxpage/foxpage-client-types';

// EntryContent

export interface AppComponentFetchParams extends Omit<CommonFetchParams, 'id' | 'organizationId'> {
  type: PackageType;
}

export type AppComponentFetchComponentsParams = Pick<AppComponentFetchParams, 'applicationId'> &
  PaginationReqParams &
  Partial<Pick<AppComponentFetchParams, 'type'>> & {
    forceSearch?: boolean;
  };

export interface AppComponentAddComponentParams
  extends Pick<AppComponentFetchParams, 'applicationId' | 'type'> {
  name: string;
  componentType: ComponentType;
}

export interface AppComponentDeleteComponentParams extends AppComponentFetchComponentsParams {
  id: string;
}

export interface AppComponentSetComponentParams {
  applicationId: string;
  id: string;
  intro: string;
  loadOnIgnite: boolean;
}

// GetComponentsVersionSearchsProps
export type ComponentsVersionFetchParams = AppComponentDeleteComponentParams & PaginationReqParams;

// PostComponentsVersionsProps
export type ComponentsVersionSaveParams = Pick<ComponentVersionEntity, 'contentId' | 'version' | 'content'> &
  Pick<AppComponentFetchParams, 'applicationId'> & { componentType: ComponentType };

// PutComponentsLiveVersionProps
export type ComponentsLiveVersionUpdateParams = Pick<ComponentVersionEntity, 'id' | 'versionNumber'> &
  Pick<AppComponentFetchParams, 'applicationId'>;

// PutComponentsReferLiveVersionProps
export interface ComponentsReferLiveVersionUpdateParams {
  applicationId: string;
  id: string;
  versionId: string;
}

// PutComponentsVersionPublishProps
export type ComponentsVersionPublishParams = Pick<ComponentVersionEntity, 'id' | 'status'> &
  Pick<AppComponentFetchParams, 'applicationId'>;

// PutComponentsVersionsProps
export type ComponentsVersionUpdateParams = Omit<ComponentsVersionSaveParams, 'contentId'> &
  Pick<AppComponentDeleteComponentParams, 'id'>;
