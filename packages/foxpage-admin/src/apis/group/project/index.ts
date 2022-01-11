import { BaseResponse } from '@/types/common';
import {
  ParentFileFetchParams,
  ParentFileFetchResponse,
  ProjectAddParams,
  ProjectFetchParams,
  ProjectFetchResponse,
  ProjectFileAddParams,
  ProjectFileFetchParams,
  ProjectFileFetchResponse,
  ProjectUpdateParams,
} from '@/types/project';
import FoxpageApi from '@/utils/foxpage-api-sdk';

export const fetchProjects = (params: ProjectFetchParams): Promise<ProjectFetchResponse> =>
  new Promise(resolve => {
    FoxpageApi.get('/project-searchs', params, (rs: ProjectFetchResponse) => {
      resolve(rs);
    });
  });

export const addProject = (params: ProjectAddParams): Promise<BaseResponse> =>
  new Promise(resolve => {
    FoxpageApi.post('/projects', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const updateProject = (params: ProjectUpdateParams): Promise<BaseResponse> =>
  new Promise(resolve => {
    FoxpageApi.put('/projects', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const addPage = (params: ProjectFileAddParams) =>
  new Promise(resolve => {
    FoxpageApi.post('/pages', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const updatePage = (params: ProjectFileAddParams) =>
  new Promise(resolve => {
    FoxpageApi.put('/pages', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const addTemplate = (params: ProjectFileAddParams) =>
  new Promise(resolve => {
    FoxpageApi.post('/templates', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const updateTemplate = (params: ProjectFileAddParams) =>
  new Promise(resolve => {
    FoxpageApi.put('/templates', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const getProjectFiles = (params: ProjectFileFetchParams): Promise<ProjectFileFetchResponse> =>
  new Promise(resolve => {
    FoxpageApi.get('/projects/files', params, (rs: ProjectFileFetchResponse) => {
      resolve(rs);
    });
  });

export const deleteProject = (params: { projectId: string; applicationId: string; status: boolean }) =>
  new Promise(resolve => {
    FoxpageApi.put('/projects/status', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const fetchParentFiles = (params: ParentFileFetchParams): Promise<ParentFileFetchResponse> =>
  new Promise(resolve => {
    FoxpageApi.get('/files/parents', params, (rs: ParentFileFetchResponse) => {
      resolve(rs);
    });
  });
