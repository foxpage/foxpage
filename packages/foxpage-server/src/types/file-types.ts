import {
  AppFolderTypes,
  AppResource,
  Content,
  ContentVersion,
  File,
  FileTypes,
  Folder,
  Tag,
} from '@foxpage/foxpage-server-types';

import { AppBaseInfo } from './app-types';
import { Creator, FoxCtx } from './index-types';

export type FolderInfo = Exclude<Folder, 'creator' | 'applicationId'> & { creator: Creator } & {
  application: AppBaseInfo;
};
export type FileInfo = Exclude<File, 'creator' | 'applicationId'> & { creator: Creator } & {
  application: AppBaseInfo;
};
export type FileFolderInfo = { folders: FolderInfo[]; files: FileInfo[] };
export type FolderUserInfo = Exclude<Folder, 'creator'> & { creator: Creator };
export type FileUserInfo = Exclude<File, 'creator'> & { creator: Creator };
export type AppFolder = Pick<Folder, 'applicationId' | 'parentFolderId'>;
export type AppFolderType = { applicationId: string; type: AppFolderTypes };
export type AppsFolderType = { applicationIds: string[]; type: AppFolderTypes };
export type FolderChildren = Folder & { children: FileFolderChildren };
export type FileFolderChildren = { folders: FolderChildren[]; files: File[] };
export type FileContent = File & { content?: any; contentId?: string };
export type FileContentInfo = File & { contents?: Content[] };
export type FileFolderContentChildren = { folders: FolderChildren[]; files: FileContent[] };
export type FolderResourceGroup = Folder & { groups: AppResource };
export type FileAssoc = FileUserInfo & {
  folderName: string;
  content: ContentVersion;
  contentId?: string;
  online?: boolean;
};
export type FilePathSearch = FolderPathSearch & { fileName: string };
export type FilePageSearch = Exclude<FolderPageSearch, 'parentFolderId'> & {
  folderId?: string;
  type?: string;
  sort?: Record<string, number>;
};

export type FileWithOnline = File & { online: boolean };

export type ResourceFolderChildren = Folder & {
  newVersion?: NewResourceDetail;
  children: FileFolderChildren;
};
export type ResourceFolderContentChildren = {
  folders: ResourceFolderChildren[];
  files: FileContent[];
  newResources?: NewResourceDetail[];
};

export interface AppFileType {
  applicationId: string;
  type: string | string[];
}

export interface FileCheck {
  name: string;
  applicationId: string;
  type: FileTypes;
  suffix: string;
  folderId: string;
  deleted?: boolean;
}

export interface FolderCheck {
  name: string;
  applicationId: string;
  parentFolderId: string;
  deleted?: boolean;
}

export interface FolderPageSearch {
  applicationId: string;
  search?: string;
  parentFolderId?: string;
  from?: number;
  to?: number;
}

export interface WorkspaceFolderSearch {
  creator: string;
  types: string[];
  deleted?: boolean;
  sort?: Record<string, number>;
  search?: string;
  page?: number;
  size?: number;
}

export interface FileNameSearch {
  applicationId: string;
  fileNames: string[];
  type: string | string[];
}

export interface FolderPathSearch {
  applicationId: string;
  parentFolderId: string;
  pathList: string[];
}

export interface ResourceSearch {
  applicationId: string;
  id?: string;
  name?: string;
}

export interface AppFolderSearch {
  deleted?: boolean;
  search?: string;
  page?: number;
  size?: number;
  parentFolderId?: string;
  parentFolderIds?: string[];
}

export interface FolderChildrenSearch {
  parentFolderIds: string[];
  search?: string;
  page?: number;
  size?: number;
  sort?: Record<string, number>;
}

export interface AppFolderSearchByName {
  applicationId: string;
  name: string;
  parentFolderId: string;
}

export interface AppDefaultFolderSearch {
  applicationIds: string[];
  type: AppFolderTypes;
}

export interface AppTypeFolderUpdate {
  applicationId: string;
  id: string;
  name?: string;
  intro?: string;
  folderPath?: string;
}

export interface AppTypeFileUpdate {
  applicationId: string;
  id: string;
  name?: string;
  intro?: string;
  tags?: Tag[];
}

export interface FileContentVersion {
  ctx: FoxCtx;
  hasVersion?: boolean;
  content?: any;
}

export interface NewFileInfo {
  name: string;
  applicationId: string;
  type: FileTypes;
  creator?: string;
  folderId?: string;
  suffix?: string;
  intro?: string;
  tags?: any[];
  content?: any;
}

export interface FileListSearch {
  applicationId: string;
  id: string;
  deleted?: boolean;
  search?: string;
  page?: number;
  size?: number;
}

export interface ProjectPageContent {
  fileId: string;
  path: string;
  version: string;
  content: any;
}

export interface AppFileTag {
  applicationId: string;
  fileId: string;
  tags: Tag[];
}

export interface AppFileList {
  applicationId: string;
  ids: string[];
}

export interface AppTypeFileParams {
  applicationId: string;
  type: string;
  deleted: boolean;
  search?: string;
}

export interface NewResourceDetail {
  id?: string;
  name: string;
  version: string;
  resourceName: string;
  files: Record<string, any>;
  isNew: boolean;
  meta?: Record<string, any>;
  schema?: Record<string, any>;
}
