import { Application } from '@/types/application';
import { BaseResponse, OptionsAction, PaginationReqParams } from '@/types/common';
import { FileTag } from '@/types/common/tag';
import { Creator } from '@/types/user';

export * from './content';
export * from './file';

export interface ProjectType {
  id: string;
  name: string;
  intro: string;
  application: Application;
  creator: Creator;
}

export interface ProjectFileType {
  id: string;
  name: string;
  intro: string;
  applicationId: string;
  creator: Creator;
  type: string;
  suffix: string;
  folderId: string;
  createTime: string;
  updateTime: string;
  deleted: boolean;
  tags: FileTag[];
  online: boolean;
}

export interface ProjectFolderType {
  id: string;
  name: string;
  intro: string;
  applicationId: string;
  creator: Creator;
  type: string;
  folderPath: string;
  parentFolderId: string;
  createTime: string;
  updateTime: string;
  deleted: boolean;
}

export interface ProjectDetailUrlParams {
  folderId: string;
  applicationId: string;
  organizationId: string;
}

export interface ProjectContentUrlParams extends ProjectDetailUrlParams {
  fileId: string;
}

export interface ProjectPublishParams {
  applicationId: string;
  projectId: string;
  ids?: string[];
}

export interface ProjectSaveParams extends OptionsAction {
  organizationId: string;
}

export interface ProjectAddParams {
  applicationId: string;
  name: string;
  organizationId: string;
  type: string;
}

export interface ProjectFetchParams extends PaginationReqParams {
  organizationId: string;
}
export interface ProjectFetchResponse extends BaseResponse {
  data: ProjectType[];
}

export interface ProjectUpdateParams extends ProjectAddParams {
  id: string;
}

export interface ParentFile {
  name: string;
  id: string;
  folderPath: string;
  deleted: boolean;
}

export interface ParentFileFetchParams {
  applicationId: string;
  id: string;
}
export interface ParentFileFetchResponse extends BaseResponse {
  data: ParentFile[];
}
