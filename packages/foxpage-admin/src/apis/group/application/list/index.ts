import {
  Application,
  ApplicationDetailFetchResponse,
  ApplicationFetchParams,
  ApplicationFetchResponse,
  ApplicationUpdateType,
  PaginationReqParams,
  ResponseBody,
} from '@/types/index';
import FoxpageApi from '@/utils/foxpage-api-sdk';

export const fetchList = (params: ApplicationFetchParams): Promise<ApplicationFetchResponse> =>
  new Promise(resolve => {
    FoxpageApi.get('/application-searchs', params, (rs: ApplicationFetchResponse) => {
      resolve(rs);
    });
  });

export const addApp = (params: Application): Promise<ResponseBody> =>
  new Promise(resolve => {
    FoxpageApi.post('/applications', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const updateApp = (params: ApplicationUpdateType): Promise<ResponseBody> =>
  new Promise(resolve => {
    FoxpageApi.put('/applications', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const getAppDetail = ({ applicationId }: { applicationId: string }): Promise<ApplicationDetailFetchResponse> =>
  new Promise(resolve => {
    FoxpageApi.get('/applications', { applicationId }, (rs: ApplicationDetailFetchResponse) => {
      resolve(rs);
    });
  });

export const getAllLocales = ({ applicationId }: { applicationId: string }): Promise<ResponseBody<string[]>> =>
  new Promise(resolve => {
    FoxpageApi.get('/applications/locales', { applicationId }, (rs: ResponseBody<string[]>) => {
      resolve(rs);
    });
  });

export const fetchAllApplicationList = (params: PaginationReqParams): Promise<ApplicationFetchResponse> =>
  new Promise(resolve => {
    FoxpageApi.get('/applications-all-searchs', params, (rs: ApplicationFetchResponse) => {
      resolve(rs);
    });
  });
