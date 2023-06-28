import { CommonFetchParams } from '@foxpage/foxpage-client-types';

export interface AppResourcesDetailsFetchResourcesListParams
  extends Pick<CommonFetchParams, 'applicationId'> {
  folderPath?: string;
}

export interface AppResourcesDetailsFetchGroupInfoParams
  extends Pick<AppResourcesDetailsFetchResourcesListParams, 'applicationId'> {
  path: string;
}

export interface AppResourcesDetailsAddFileParams
  extends Pick<AppResourcesDetailsFetchResourcesListParams, 'applicationId'> {
  curFolderId: string;
  filepath: string;
}

export interface AppResourcesDetailsAddFolderParams
  extends Pick<AppResourcesDetailsAddFileParams, 'applicationId' | 'curFolderId'> {
  name: string;
}

export interface AppResourcesDetailsUpdateFileParams
  extends Pick<AppResourcesDetailsAddFileParams, 'applicationId' | 'filepath'> {
  fileId: string;
}

export interface AppResourcesDetailsUpdateFolderParams
  extends Pick<AppResourcesDetailsAddFolderParams, 'applicationId' | 'name'> {
  folderId: string;
}

export interface AppResourcesDetailsRemoveResourcesParams
  extends Pick<AppResourcesDetailsFetchResourcesListParams, 'applicationId'> {
  ids: string[];
}
