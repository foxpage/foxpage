import {
  Application,
  ApplicationDetailFetchResponse,
  ApplicationListFetchParams,
  ApplicationListFetchResponse,
  ApplicationSaveParams,
  PaginationReqParams,
  ResponseBody,
} from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const fetchList = (params: ApplicationListFetchParams): Promise<ApplicationListFetchResponse> =>
  new Promise((resolve) => {
    FoxPageApi.get('/application-searchs', params, (rs: ApplicationListFetchResponse) => {
      resolve(rs);
    });
  });

export const addApp = (params: Application): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.post('/applications', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const fetchAllApplicationList = (params: PaginationReqParams): Promise<ApplicationListFetchResponse> =>
  new Promise((resolve) => {
    FoxPageApi.get('/applications-all-searchs', params, (rs: ApplicationListFetchResponse) => {
      resolve(rs);
    });
  });

export const fetchAppDetail = ({
  applicationId,
}: {
  applicationId: string;
}): Promise<ApplicationDetailFetchResponse> =>
  new Promise((resolve) => {
    FoxPageApi.get('/applications', { applicationId }, (rs: ApplicationDetailFetchResponse) => {
      resolve(rs);
    });
  });

// settings
export const fetchAllLocales = ({
  applicationId,
}: {
  applicationId: string;
}): Promise<ResponseBody<string[]>> =>
  new Promise((resolve) => {
    FoxPageApi.get('/applications/locales', { applicationId }, (rs: ResponseBody<string[]>) => {
      resolve(rs);
    });
  });

export const updateApp = (params: ApplicationSaveParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.put('/applications', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });
