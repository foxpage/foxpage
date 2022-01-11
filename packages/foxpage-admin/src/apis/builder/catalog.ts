import { CatalogFetchParams, FileCatalogResponse, ProjectCatalogResponse } from '@/types/builder/more';
import FoxpageApi from '@/utils/foxpage-api-sdk';

export const fetchFolderCatalog = (params: CatalogFetchParams): Promise<ProjectCatalogResponse> =>
  new Promise(resolve => {
    FoxpageApi.get('/projects/catalogs', params, (rs: ProjectCatalogResponse) => {
      resolve(rs);
    });
  });

export const fetchPagesCatalog = (params: CatalogFetchParams): Promise<FileCatalogResponse> =>
  new Promise(resolve => {
    FoxpageApi.get('/pages/catalogs', params, (rs: FileCatalogResponse) => {
      resolve(rs);
    });
  });

export const fetchTemplatesCatalog = (params: CatalogFetchParams): Promise<FileCatalogResponse> =>
  new Promise(resolve => {
    FoxpageApi.get('/templates/catalogs', params, (rs: FileCatalogResponse) => {
      resolve(rs);
    });
  });
