import { BaseResponse } from '@/types/common';
import { FileTag, PaginationReqParams, ProjectFileType } from '@/types/index';

export interface ProjectFileSearchParams extends PaginationReqParams {
  applicationId: string;
  folderId: string;
}

export interface ProjectFileSaveParams {
  folderId: string;
  applicationId: string;
}

export interface ProjectFileDeleteParams extends ProjectFileSaveParams {
  id: string;
}

export interface ProjectFileDeleteReqParams {
  id: string;
  applicationId: string;
  status: boolean;
}

export interface ProjectFileDetailFetchResponse extends ResponseBody {
  data?: ProjectFileType[];
}

export interface ProjectFileAddParams {
  id: string;
  applicationId: string;
  name: string;
  folderId: string;
  suffix: string;
  tags: FileTag[];
}

export interface ProjectFileFetchParams extends PaginationReqParams {
  id: string;
  applicationId: string;
}

export interface ProjectFileFetchResponse extends BaseResponse {
  data: ProjectFileType[];
}
