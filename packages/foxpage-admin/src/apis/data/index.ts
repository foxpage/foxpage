import { DataBaseQueryParams, ResponseBody } from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const fetchCollectionList = (): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.get('/databases/collections', {}, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const queryDataBase = (params: DataBaseQueryParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.post('/databases/query', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });
