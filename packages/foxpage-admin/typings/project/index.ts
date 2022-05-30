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
  application: Pick<Application, 'id' | 'name'>;
  creator: Creator;
}

export interface ProjectFileType {
  application: Pick<Application, 'id' | 'name'>;
  createTime: string;
  creator: Creator;
  deleted: boolean;
  folderId: string;
  id: string;
  intro: string;
  name: string;
  suffix: string;
  tags: FileTag[];
  type: string;
  updateTime: string;
  online: boolean;
  hasContent: boolean;
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
  type?: string;
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

export interface ProjectListFetchParams extends PaginationReqParams {
  organizationId: string;
  type?: string;
}

// recycle
export interface ProjectCommonFetchParams extends PaginationReqParams {
  organizationId: string;
}
