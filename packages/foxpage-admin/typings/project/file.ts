import {
  CommonFetchParams,
  File,
  FileScope,
  PaginationReqParams,
  ParentFile,
  ProjectFile,
  ResponseBody,
} from '@foxpage/foxpage-client-types';

export interface ProjectFileListFetchParams extends Omit<CommonFetchParams, 'organizationId' | 'id'> {
  folderId: string;
}

export type ProjectFileAddParams = Pick<ProjectFile, 'applicationId' | 'folderId' | 'id'> &
  Pick<File, 'name' | 'suffix' | 'tags'>;

export interface ProjectFileSaveParams extends Pick<ProjectFile, 'applicationId' | 'folderId'> {
  name?: string;
}

export type ProjectFileDeleteParams = Pick<ProjectFile, 'applicationId' | 'folderId' | 'id'>;

export interface ProjectFileDeleteReqParams extends Pick<ProjectFile, 'applicationId' | 'id'> {
  status: boolean;
}

export type ProjectFileFetchParams = Pick<ProjectFile, 'applicationId' | 'id'> & PaginationReqParams;

export interface ProjectFileFetchResponse extends ResponseBody {
  data: File[];
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

// application all file
export type ApplicationFileListFetchParams = Pick<ProjectFile, 'applicationId'> &
  PaginationReqParams & {
    scope?: FileScope;
  };

export interface ApplicationFileUpdateParams extends Pick<ApplicationFileListFetchParams, 'applicationId'> {
  file: File;
}
