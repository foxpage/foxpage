import { PaginationReqParams } from '@/types/common';
import { ProjectCommonFetchParams } from '@/types/project';
import { DynamicSearchResult, MyProjectSearchResult } from '@/types/workspace';
import FoxpageApi from '@/utils/foxpage-api-sdk';

export const searchMyProjects = (params: PaginationReqParams): Promise<MyProjectSearchResult> =>
  new Promise((resolve) => {
    FoxpageApi.get('/workspaces/project-searchs', params, (rs: MyProjectSearchResult) => {
      resolve(rs);
    });
  });

export const searchRecycles = (params: ProjectCommonFetchParams): Promise<MyProjectSearchResult> =>
  new Promise((resolve) => {
    FoxpageApi.get('/workspaces/recycle-searchs', params, (rs: MyProjectSearchResult) => {
      resolve(rs);
    });
  });

export const searchDynamics = (params: PaginationReqParams): Promise<DynamicSearchResult> =>
  new Promise((resolve) => {
    FoxpageApi.get('/workspaces/dynamic-searchs', params, (rs: DynamicSearchResult) => {
      resolve(rs);
    });
  });
