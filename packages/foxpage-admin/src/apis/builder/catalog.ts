import { CatalogFetchParams, CatalogFetchResponse } from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const fetchCatalog = (params: CatalogFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/projects/catalogs', params, (rs: CatalogFetchResponse) => {
      resolve(rs);
    });
  });
