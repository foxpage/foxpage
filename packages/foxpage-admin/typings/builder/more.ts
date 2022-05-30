import { PageContentType, PageFileType } from '@/types/builder';
import { BaseResponse } from '@/types/common/request';

export interface BuildVersionFetchParams {
  applicationId: string;
  id: string;
}

export interface PageLivesFetchParams {
  applicationId: string;
  ids: string[];
}

export interface DslFetchParams {
  applicationId: string;
  ids: string[];
}

export interface CatalogFetchParams {
  applicationId: string;
  id: string;
}

export interface ProjectCatalogResponse extends BaseResponse {
  data: Array<PageFileType>;
}

export interface FileCatalogResponse extends BaseResponse {
  data: Array<PageContentType>;
}
