import { PageContentType, PageFileType } from '@/types/builder';
import { BaseResponse } from '@/types/common/request';

export interface DslFetchParams {
  applicationId: string;
  id: string;
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
