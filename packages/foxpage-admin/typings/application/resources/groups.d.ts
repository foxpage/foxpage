import { FileTagType } from '@/constants/file';
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
    manifestPath: string;
  };
}
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
