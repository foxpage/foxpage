import { Application } from '@/types/index';

import {
  ApplicationDetailFetchResponse,
  ApplicationListFetchParams,
  ApplicationListFetchResponse,
  ApplicationSaveParams,
  PaginationReqParams,
  ResponseBody,
  ScreenshotFetchedRes,
  ScreenshotFetchParams,
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

export const deleteApp = (applicationId: string): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.put('/applications/status', { applicationId }, (rs: ResponseBody) => {
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

export const getScreenshot = (params: ScreenshotFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.post('/pictures', params, (rs: ScreenshotFetchedRes) => {
      resolve(rs);
    });
  });
