import {
  ComponentListFetchParams,
  ComponentListResponse,
  DslUpdateParams,
  PageCloneParams,
  PagePublishParams,
  TemplateFetchResponse,
} from '@/types/builder';
import { DslFetchParams } from '@/types/builder/more';
import { BaseResponse } from '@/types/common';
import FoxpageApi from '@/utils/foxpage-api-sdk';

export const fetchLiveComponentList = (params: ComponentListFetchParams): Promise<ComponentListResponse> =>
  new Promise(resolve => {
    FoxpageApi.post('/components/live-version-infos', params, (rs: ComponentListResponse) => {
      resolve(rs);
    });
  });

export const fetchPageBuildVersion = (params: DslFetchParams): Promise<ComponentListResponse> =>
  new Promise(resolve => {
    FoxpageApi.get('/pages/build-versions', params, (rs: ComponentListResponse) => {
      resolve(rs);
    });
  });

export const fetchTemplateBuildVersion = (params: DslFetchParams): Promise<ComponentListResponse> =>
  new Promise(resolve => {
    FoxpageApi.get('/templates/build-versions', params, (rs: ComponentListResponse) => {
      resolve(rs);
    });
  });

export const updatePageDsl = (params: DslUpdateParams): Promise<BaseResponse> =>
  new Promise(resolve => {
    FoxpageApi.put('/pages/versions', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const updateTemplateDsl = (params: DslUpdateParams): Promise<BaseResponse> =>
  new Promise(resolve => {
    FoxpageApi.put('/templates/versions', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });
export const publishPage = (params: PagePublishParams) =>
  new Promise(resolve => {
    FoxpageApi.put('/pages/publish', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });
export const publishTemplate = (params: PagePublishParams) =>
  new Promise(resolve => {
    FoxpageApi.put('/templates/publish', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const fetchPageDsl = (params: DslFetchParams) =>
  new Promise(resolve => {
    FoxpageApi.post('/pages/draft-infos', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const fetchTemplateDsl = (params: DslFetchParams) =>
  new Promise(resolve => {
    FoxpageApi.post('/templates/draft-infos', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const getTemplates = (params: { applicationId: string }): Promise<TemplateFetchResponse> =>
  new Promise(resolve => {
    FoxpageApi.get('/templates', params, (rs: TemplateFetchResponse) => {
      resolve(rs);
    });
  });

export const clonePage = (params: PageCloneParams): Promise<BaseResponse> =>
  new Promise(resolve => {
    FoxpageApi.put('/pages/clone', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });
