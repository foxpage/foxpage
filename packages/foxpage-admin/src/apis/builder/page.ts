import { PageTemplateFetchParams, ResponseBody } from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const fetchPageDsl = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.post('/pages/draft-infos', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const fetchTemplateDsl = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.post('/templates/draft-infos', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const updatePageDsl = (params: any): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.put('/pages/versions', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const updateTemplateDsl = (params: any): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.put('/templates/versions', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const publishPage = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.put('/pages/publish', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });
export const publishTemplate = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.put('/templates/publish', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const fetchTemplates = (params: { applicationId: string }): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.get('/templates', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const clonePage = (params: any): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.put('/pages/clone', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const fetchPageBuilderItems = (params: PageTemplateFetchParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.get('/pages/builder-items', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });
