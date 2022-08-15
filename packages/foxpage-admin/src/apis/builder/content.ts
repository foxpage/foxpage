import {
  BaseResponse,
  ContentFetchParams,
  ContentPublishedRes,
  ContentPublishParams,
  ContentSavedRes,
  ContentSaveParams,
  PageContent,
} from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const fetchPageBuildVersion = (params: ContentFetchParams): Promise<PageContent> =>
  new Promise((resolve) => {
    FoxPageApi.get('/pages/build-versions', params, (rs: PageContent) => {
      resolve(rs);
    });
  });
export const fetchPageLiveVersion = (params: ContentFetchParams): Promise<PageContent> =>
  new Promise((resolve) => {
    FoxPageApi.get('/pages/live-version', params, (rs: PageContent) => {
      resolve(rs);
    });
  });

export const fetchTemplateBuildVersion = (params: ContentFetchParams): Promise<PageContent> =>
  new Promise((resolve) => {
    FoxPageApi.get('/templates/build-versions', params, (rs: PageContent) => {
      resolve(rs);
    });
  });

export const fetchPageDsl = (params: ContentFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.post('/pages/draft-infos', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const fetchTemplateDsl = (params: ContentFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.post('/templates/draft-infos', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const savePageContent = (params: ContentSaveParams): Promise<ContentSavedRes> =>
  new Promise((resolve) => {
    FoxPageApi.put('/pages/versions', params, (rs: ContentSavedRes) => {
      resolve(rs);
    });
  });

export const saveTemplateContent = (params: ContentSaveParams): Promise<ContentSavedRes> =>
  new Promise((resolve) => {
    FoxPageApi.put('/templates/versions', params, (rs: ContentSavedRes) => {
      resolve(rs);
    });
  });

export const publishPage = (params: ContentPublishParams) =>
  new Promise((resolve) => {
    FoxPageApi.put('/pages/publish', params, (rs: ContentPublishedRes) => {
      resolve(rs);
    });
  });

export const publishTemplate = (params: ContentPublishParams) =>
  new Promise((resolve) => {
    FoxPageApi.put('/templates/publish', params, (rs: ContentPublishedRes) => {
      resolve(rs);
    });
  });
