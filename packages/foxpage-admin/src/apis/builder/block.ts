import {
  BaseResponse,
  ComponentEntity,
  ContentCreateParams,
  ContentFetchParams,
  ContentPublishedRes,
  ContentPublishParams,
  ContentSavedRes,
  ContentSaveParams,
  PageContent,
  ProjectContentFetchParams,
  ProjectFileAddParams,
  ResponseBody,
} from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

import { GetComponentSearchsProps } from '../application';

export const fetchLiveBlockDsl = (params: { applicationId: string; ids: string[]; locale: string }) =>
  new Promise((resolve) => {
    FoxPageApi.post('/blocks/locale-live-version', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const fetchBlockBuildVersion = (params: ContentFetchParams): Promise<PageContent> =>
  new Promise((resolve) => {
    FoxPageApi.get('/blocks/build-versions', params, (rs: PageContent) => {
      resolve(rs);
    });
  });

export const fetchBlockDsl = (params: ContentFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.post('/blocks/draft-infos', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const saveBlockContent = (params: ContentSaveParams): Promise<ContentSavedRes> =>
  new Promise((resolve) => {
    FoxPageApi.put('/blocks/versions', params, (rs: ContentSavedRes) => {
      resolve(rs);
    });
  });

export const publishBlock = (params: ContentPublishParams) =>
  new Promise((resolve) => {
    FoxPageApi.put('/blocks/publish', params, (rs: ContentPublishedRes) => {
      resolve(rs);
    });
  });

export const addBlock = (params: ProjectFileAddParams) =>
  new Promise((resolve) => {
    FoxPageApi.post('/blocks', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const updateBlock = (params: ProjectFileAddParams) =>
  new Promise((resolve) => {
    FoxPageApi.put('/blocks', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const fetchBlockContents = (params: ProjectContentFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/blocks/content-searchs', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const addBlockContent = (params: ContentCreateParams) =>
  new Promise((resolve) => {
    FoxPageApi.post('/blocks/contents', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const deleteBlockContent = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.put('/blocks/content-status', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const updateBlockContent = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.put('/blocks/contents', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

// search blocks
export const getBlockSearchs = (params: GetComponentSearchsProps): Promise<ResponseBody<ComponentEntity[]>> =>
  new Promise((resolve) => {
    FoxPageApi.get('/projects/block-content/searchs', params, (rs) => {
      resolve(rs);
    });
  });
