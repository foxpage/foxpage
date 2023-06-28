import {
  AppFolderTypes,
  AppResource,
  Content,
  DSL,
  File,
  FileTypes,
  Folder,
  Tag,
} from '@foxpage/foxpage-server-types';

import { ContentInfo } from './content-types';
import { Creator, FoxCtx, IdName, Search } from './index-types';
import { UserBase } from './user-types';

export type FolderInfo = Exclude<Folder, 'creator' | 'applicationId'> & { creator: Creator } & {
  application: IdName;
  organization?: IdName;
};
export type FileInfo = Exclude<File, 'creator' | 'applicationId'> & { creator: Creator } & {
  application: IdName;
  hasContent?: boolean;
  hasLiveContent?: boolean;
};
export type FileFolderInfo = { folders: FolderInfo[]; files: FileInfo[] };
export type FolderUserInfo = Exclude<Folder, 'creator'> & { creator: Creator };
export type FileUserInfo = Exclude<File, 'creator'> & { creator: Creator };
export type AppFolder = Pick<Folder, 'applicationId' | 'parentFolderId'>;
export type AppFolderType = { applicationId: string; type: AppFolderTypes };
export type AppsFolderType = { applicationIds: string[]; type: AppFolderTypes };
export type FolderChildren = Folder & { children: FileFolderChildren };
export type FileFolderChildren = { folders: FolderChildren[]; files: File[] };
export type FileFolderContentInfoChildren = { folders: FolderChildren[]; files: FileContentInfo[] };
export type FileContent = File & { content?: any; contentId?: string };
export type FileContentInfo = File & { contents?: ContentInfo[] };
export type FileFolderContentChildren = { folders: FolderChildren[]; files: FileContent[] };
export type FolderResourceGroup = Folder & { groups: AppResource };
export type FileContents = File & { contents: Content[] };
export type FileAssoc = FileUserInfo & {
  folderName: string;
  content: DSL;
  application?: IdName;
  contentId?: string;
  online?: boolean;
  version?: {
    base?: string;
    live?: string;
  };
};
export type FilePathSearch = FolderPathSearch & { fileName: string };
export type FilePageSearch = Exclude<FolderPageSearch, 'parentFolderId'> & {
  folderId?: string;
  type?: string;
  sort?: Record<string, number>;
};

export type FileWithOnline = _.Omit<File, 'creator'> & { online: boolean; creator: UserBase };

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
  search?: string;
  loadOnIgnite?: boolean | undefined;
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

export interface WorkspaceFolderSearch extends Search {
  creator: string;
  types: string[];
  organizationId?: string;
  applicationIds?: string[];
  sort?: Record<string, number>;
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

export interface AppFolderSearch extends Search {
  parentFolderId?: string;
  parentFolderIds?: string[];
}

export interface FolderChildrenSearch extends Search {
  types?: string[];
  applicationIds?: string[];
  organizationId?: string;
  folderIds?: string[];
  userIds?: string[];
  searchType?: string;
  sort?: Record<string, number>;
}

export interface UserFileFolderSearch extends Search {
  types?: string[];
  userId?: string;
  applicationIds?: string[];
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
  subType?: string;
  componentType?: string;
  creator?: string;
  folderId?: string;
  suffix?: string;
  intro?: string;
  tags?: any[];
  content?: any;
}

export interface FileListSearch extends Search {
  applicationId: string;
  id: string;
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
  scope?: string;
  scopeId?: string;
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

export interface TypeItemPicInfo {
  id: string;
  name: string;
  versionId: string;
  version: string;
  pictures: { url: string; type: string; sort?: number }[];
}

export interface ThirdPartyPicRes {
  data: {
    url: string;
    name: string;
  };
}
