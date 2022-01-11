export type AppResourcesDetailsFetchResourcesListParams = {
  appId?: string;
  folderPath?: string;
}
export type AppResourcesDetailsFetchGroupInfoParams = {
  applicationId: string;
  path: string;
}
export type AppResourcesDetailsAddFileParams = {
  applicationId: string;
  curFolderId: string;
  filepath: string;
}
export type AppResourcesDetailsAddFolderParams = {
  applicationId: string;
  curFolderId: string;
  name: string;
}
export type AppResourcesDetailsUpdateFileParams = {
  applicationId: string;
  fileId: string;
  filepath: string;
}
export type AppResourcesDetailsUpdateFolderParams = {
  applicationId: string;
  folderId: string;
  name: string;
}
export type AppResourcesDetailsRemoveResourcesParams = {
  applicationId: string;
  selectedRowKeys: string[];
}
