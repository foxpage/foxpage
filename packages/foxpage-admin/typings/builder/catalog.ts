import { CommonFetchParams, ContentEntity, File, ProjectEntity, ResponseBody } from '@/types/index';

// catalog
export interface CatalogFileEntity extends File {
  contents: ContentEntity[];
  fold: boolean;
}

export interface CatalogFetchParams extends Omit<CommonFetchParams, 'organizationId'> {
  deleted?: boolean;
  folderId?: string;
  type?: string;
}

export interface CatalogFetchResponse extends ResponseBody {
  data: {
    files: ContentEntity[];
    folder?: Array<ProjectEntity>;
    id: string;
    name: string;
  };
  files: CatalogFileEntity[];
  id: string;
  name: string;
  folder?: Array<unknown>;
}

export interface CatalogContentSelectParams {
  applicationId?: string;
  contentId?: string;
  fileId?: string;
  fileType?: string;
  folderId?: string;
  locale?: string;
}
