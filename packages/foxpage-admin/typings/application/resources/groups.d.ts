import { FileTagType } from '@/constants/file';
import { BaseResponse } from '@/types/common';
import { FileTag } from '@/types/index';

export type AppResourcesGroupsFetchResourcesGroupsParams = {
  appId: string;
}
export interface AppResourcesGroupsSaveResourcesGroupParams {
  id?: string;
  appId: string;
  name: string;
  intro: string;
  resourceId: string;
  resourceType: string;
  config?: {
    resourceScope: string;
  };
}

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
  [manifest.json]?: string;
  [schema.json]?: string;
}

export interface RemoteResource {
  files: {
    cjs: CJS;
    umd: UMD;
  },
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

export type RemoteResourceSavedData = Record<string, {
  cjs: CJS;
  umd: UMD;
} & Manifest>

export interface RemoteResourceSavedRes extends BaseResponse<RemoteResourceSavedData> { }

export interface SaveResourcesGroupsRequestParams {
  id?: string;
  applicationId: string;
  name: string;
  intro?: string;
  tags: Array<{ type: FileTagType; resourceType: string; resourceId: string }>;
  config?: {
    manifestPath: string;
  };
}
export type AppResourcesGroupsDeleteResourcesGroupParams = {
  appId: string;
  id: string;
}

export interface ResourceGroup {
  applicationId: string;
  id: string;
  intro: string;
  name: string;
  folderPath: string;
  parentFolderId: string;
  tags: FileTag[];
}


export interface ResourceUrlFetchParams {
  applicationId: string;
  resourceType?: string;
  resourceScope?: string;
}

export interface ResourceUrlFetchedRes extends BaseResponse {
  url?: string;
}