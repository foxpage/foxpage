import { PaginationReqParams, ResponseBody } from '../common';
import { Creator } from '../user';

export * from './packages';
export * from './resources';
export * from './settings';

export interface ApplicationResourceType {
  id: string;
  name: string;
  type: number;
  detail: {
    host: string;
    downloadHost: string;
  }
}

export interface Application {
  id: string;
  intro: string;
  name: string;
  organizationId: string;
  slug: string;
  host: string[];
  locales: string[];
  createTime: string;
  updateTime: string;
  creator: Creator;
  deleted: boolean;
  resources: ApplicationResourceType[],
}
export interface ApplicationUpdateType {
  applicationId: string;
  intro: string;
  name: string;
  slug: string;
  host: string[];
  locales: string[];
  resources: ApplicationResourceType[],
}

export interface OrganizationUrlParams {
  organizationId: string;
}

export interface ApplicationUrlParams extends OrganizationUrlParams {
  applicationId: string;
}

export interface FolderUrlParams extends ApplicationUrlParams {
  folderId: string;
}

export interface FileUrlParams extends FolderUrlParams {
  fileId: string;
}

export interface ApplicationFetchParams extends PaginationReqParams {
  organizationId: string;
}


export interface ApplicationFetchResponse extends ResponseBody {
  data?: Application[];
}

export interface ApplicationDetailFetchResponse extends ResponseBody {
  data?: Application;
}