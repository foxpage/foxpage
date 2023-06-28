import {
  CommonDeleteParams,
  CommonSearchParams,
  FilesFetchedResponse,
  FilesFetchParams,
  GoodsCommitParams,
  GoodsOfflineParams,
  ParentFileFetchParams,
  ParentFileFetchResponse,
  ProjectAddParams,
  ProjectContentOfflineParams,
  ProjectContentSaveAsBaseParams,
  ProjectDeleteParams,
  ProjectFileAddParams,
  ProjectFileFetchParams,
  ProjectFileFetchResponse,
  ProjectListFetchParams,
  ProjectListFetchResponse,
  ProjectPageTemplateContentFetchParams,
  ProjectUpdateParams,
  ResponseBody,
} from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const fetchProjectsItems = (params: ProjectListFetchParams): Promise<ProjectListFetchResponse> =>
  new Promise((resolve) => {
    FoxPageApi.get('/projects/items', params, (rs: ProjectListFetchResponse) => {
      resolve(rs);
    });
  });

export const fetchProjects = (params: ProjectListFetchParams): Promise<ProjectListFetchResponse> =>
  new Promise((resolve) => {
    FoxPageApi.get('/project-searchs', params, (rs: ProjectListFetchResponse) => {
      resolve(rs);
    });
  });

export const addProject = (params: ProjectAddParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.post('/projects', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const deleteProject = (params: ProjectDeleteParams) =>
  new Promise((resolve) => {
    FoxPageApi.put('/projects/status', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const updateProject = (params: ProjectUpdateParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.put('/projects', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const addPage = (params: ProjectFileAddParams) =>
  new Promise((resolve) => {
    FoxPageApi.post('/pages', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const updatePage = (params: ProjectFileAddParams) =>
  new Promise((resolve) => {
    FoxPageApi.put('/pages', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const addTemplate = (params: ProjectFileAddParams) =>
  new Promise((resolve) => {
    FoxPageApi.post('/templates', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const updateTemplate = (params: ProjectFileAddParams) =>
  new Promise((resolve) => {
    FoxPageApi.put('/templates', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

// file relation
export const deleteFile = (params: CommonDeleteParams) =>
  new Promise((resolve) => {
    FoxPageApi.put('/file/delete', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const deletePage = (params: CommonDeleteParams) =>
  new Promise((resolve) => {
    FoxPageApi.put('/pages/status', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const deleteTemplate = (params: CommonDeleteParams) =>
  new Promise((resolve) => {
    FoxPageApi.put('/templates/status', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const deleteBlock = (params: CommonDeleteParams) =>
  new Promise((resolve) => {
    FoxPageApi.put('/blocks/status', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const getProjectFiles = (params: ProjectFileFetchParams): Promise<ProjectFileFetchResponse> =>
  new Promise((resolve) => {
    FoxPageApi.get('/projects/files', params, (rs: ProjectFileFetchResponse) => {
      resolve(rs);
    });
  });

export const fetchParentFiles = (params: ParentFileFetchParams): Promise<ParentFileFetchResponse> =>
  new Promise((resolve) => {
    FoxPageApi.get('/files/parents', params, (rs: ParentFileFetchResponse) => {
      resolve(rs);
    });
  });

export const fetchFileDetail = (params: FilesFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.post('/files', params, (rs: FilesFetchedResponse) => {
      resolve(rs);
    });
  });

export const commitToStore = (params: GoodsCommitParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.post('/stores/goods', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const offlineFromStore = (params: GoodsOfflineParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.put('/stores/goods-offline', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

// content relation
// page
export const fetchPageContents = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.get('/pages/content-searchs', params, (rs: any) => {
      resolve(rs);
    });
  });

export const addPageContent = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.post('/pages/contents', params, (rs: any) => {
      resolve(rs);
    });
  });

export const deletePageContent = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.put('/pages/content-status', params, (rs: any) => {
      resolve(rs);
    });
  });

export const updatePageContent = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.put('/pages/contents', params, (rs: any) => {
      resolve(rs);
    });
  });

// template
export const fetchTemplateContents = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.get('/templates/content-searchs', params, (rs: any) => {
      resolve(rs);
    });
  });

export const addTemplateContent = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.post('/templates/contents', params, (rs: any) => {
      resolve(rs);
    });
  });

export const deleteTemplateContent = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.put('/templates/content-status', params, (rs: any) => {
      resolve(rs);
    });
  });

export const updateTemplateContent = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.put('/templates/contents', params, (rs: any) => {
      resolve(rs);
    });
  });

export const fetchProjectTemplateContent = (params: ProjectPageTemplateContentFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/projects/template-content/search', params, (rs: any) => {
      resolve(rs);
    });
  });

export const fetchProjectPageContent = (params: ProjectPageTemplateContentFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/projects/page-content/search', params, (rs: any) => {
      resolve(rs);
    });
  });

export const offlineProjectPageContent = (params: ProjectContentOfflineParams) =>
  new Promise((resolve) => {
    FoxPageApi.put('/pages/content-offline', params, (rs: any) => {
      resolve(rs);
    });
  });

export const offlineProjectTemplateContent = (params: ProjectContentOfflineParams) =>
  new Promise((resolve) => {
    FoxPageApi.put('/templates/content-offline', params, (rs: any) => {
      resolve(rs);
    });
  });

export const saveAsBaseContent = (params: ProjectContentSaveAsBaseParams) =>
  new Promise((resolve) => {
    FoxPageApi.post('/contents/base', params, (rs: any) => {
      resolve(rs);
    });
  });

// common search
export const fetchProjectItems = (params: CommonSearchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/search', params, (rs: any) => {
      resolve(rs);
    });
  });
