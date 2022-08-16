import {
  AbstractEntity,
  Application,
  CommonFetchParams,
  FileTag,
  PaginationReqParams,
  ResponseBody,
} from '@/types/index';

export interface ProjectFile extends Pick<AbstractEntity, 'id' | 'createTime' | 'creator' | 'updateTime'> {
  name: string;
  applicationId: string;
  folderId: string;
}

export interface File extends Pick<ProjectFile, 'id' | 'createTime' | 'creator' | 'folderId' | 'updateTime'> {
  application: Pick<Application, 'id' | 'name'>;
  deleted: boolean;
  intro: string;
  name: string;
  suffix: string;
  tags: FileTag[];
  type: FileType;
  online: boolean;
  hasContent: boolean;
}

export type FileType = 'page' | 'template' | 'variable' | 'mock' | 'condition' | 'function' | 'component' | 'editor' | 'systemComponent';

export interface ProjectFileListFetchParams extends Omit<CommonFetchParams, 'organizationId' | 'id'> {
  folderId: string;
}

export type ProjectFileAddParams = Pick<ProjectFile, 'applicationId' | 'folderId' | 'id'> &
  Pick<File, 'name' | 'suffix' | 'tags'>;

export type ProjectFileSaveParams = Pick<ProjectFile, 'applicationId' | 'folderId'>;

export type ProjectFileDeleteParams = Pick<ProjectFile, 'applicationId' | 'folderId' | 'id'>;

export interface ProjectFileDeleteReqParams extends Pick<ProjectFile, 'applicationId' | 'id'> {
  status: boolean;
}

export type ProjectFileFetchParams = Pick<ProjectFile, 'applicationId' | 'id'> & PaginationReqParams;

export interface ProjectFileFetchResponse extends ResponseBody {
  data: File[];
}

// parent file
export interface ParentFile extends Pick<File, 'id' | 'name' | 'deleted'> {
  folderPath: string;
}

export type ParentFileFetchParams = Pick<ProjectFile, 'id' | 'applicationId'>;

export interface ParentFileFetchResponse extends ResponseBody {
  data: ParentFile[];
}

export interface FilesFetchParams extends Pick<ProjectFile, 'applicationId'> {
  ids: string[];
}

export interface FilesFetchedResponse extends ResponseBody {
  data?: File[];
}

export type FileScope = 'application' | 'project';

// application all file
export type ApplicationFileListFetchParams = Pick<ProjectFile, 'applicationId'> & PaginationReqParams & {
  scope?: FileScope;
};

export interface ApplicationFileUpdateParams extends Pick<ApplicationFileListFetchParams, 'applicationId'> {
  file: File;
}
