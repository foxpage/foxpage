import { AbstractEntity, BaseResponse, CommonDeleteParams, CommonFetchParams, FileTag } from '@/types/index';

// new
export interface ApplicationResourceGroupTag {
  origin: string;
  resourceId?: string;
  resourceName?: string;
  resourceType?: string;
  resourceScope?: string;
  type?: string;
}

export interface ApplicationResourceGroupEntity
  extends Pick<AbstractEntity, 'id' | 'creator' | 'createTime' | 'updateTime'> {
  applicationId: string;
  deleted: boolean;
  folderPath: string;
  intro: string;
  name?: string;
  parentFolderId: string;
  tags: ApplicationResourceGroupTag[];
}

export interface ApplicationResourceGroupDetailEntity extends ApplicationResourceGroupEntity {
  group: Pick<AbstractEntity, 'id'> & {
    detail: {
      downloadHost: string;
      host: string;
    };
    name?: string;
    type?: string;
  };
}

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

// Statement before technical refactoring
export interface CJS {
  ['production.js']?: string;
}

export interface UMD {
  ['style.css']?: string;
  ['editor.js']?: string;
  ['development.js']?: string;
  ['production.min.js']?: string;
}

export interface Manifest {
  ['manifest.json']?: string;
  ['schema.json']?: string;
}

export interface RemoteResource {
  files: {
    cjs: CJS;
    umd: UMD;
  };
  groupId: string;
  groupName: string;
  isNew: boolean;
  name: string;
  resourceName: string;
  latestVersion: string;
  version: string;
}

export interface RemoteResourceSaveParams {
  applicationId: string;
  id: string;
  resources: RemoteResource[];
}

export type RemoteResourceSavedData = Record<
  string,
  {
    cjs: CJS;
    umd: UMD;
  } & Manifest
>;

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

export interface ResourceGroup extends Pick<AbstractEntity, 'id'> {
  applicationId: string;
  folderPath: string;
  intro: string;
  name: string;
  parentFolderId: string;
  tags: FileTag[];
}

export interface ResourceUrlFetchedRes extends BaseResponse {
  url?: string;
}
