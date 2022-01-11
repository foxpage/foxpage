import JsonStableStringify from 'json-stable-stringify';

import { AppResourceGroupType, SaveResourcesGroupsRequestParams } from '@/types/application/resources';
import { BaseResponse } from '@/types/common';
import FoxpageApi from '@/utils/foxpage-api-sdk';

export interface GetApplicationsResourcesProps {
  applicationId: string;
  type?: string;
}
export const getApplicationsResources = (
  params: GetApplicationsResourcesProps,
): Promise<BaseResponse<AppResourceGroupType[]>> =>
  new Promise(resolve => {
    FoxpageApi.get('/applications/resources', params, (rs: BaseResponse<AppResourceGroupType[]>) => {
      resolve(rs);
    });
  });

// 被注释的是提供了当用不到的接口

// /resources/contents
// export const getResourcesContents = (params: any) =>
//   new Promise((resolve) => {
//     FoxpageApi.get('/resources/contents', params, (rs: any) => {
//       resolve(rs);
//     });
//   });

export const postResourcesContents = (params: any): Promise<BaseResponse> =>
  new Promise(resolve => {
    FoxpageApi.post('/resources/contents', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const putResourcesContents = (params: any): Promise<BaseResponse> =>
  new Promise(resolve => {
    FoxpageApi.put('/resources/contents', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

// /resources
// export const getResources = (params: { applicationId: string; id: string }) =>
//   new Promise((resolve) => {
//     FoxpageApi.get('/resources', params, (rs: any) => {
//       resolve(rs);
//     });
//   });

// export const postResources = (params: any) =>
//   new Promise((resolve) => {
//     FoxpageApi.post('/resources', params, (rs: any) => {
//       resolve(rs);
//     });
//   });

// export const getResourceSearchs = (params: any) =>
//   new Promise((resolve) => {
//     FoxpageApi.get('/resource-searchs', params, (rs: any) => {
//       resolve(rs);
//     });
//   });

// /resources/status
export const putResourcesStatus = (params: any): Promise<BaseResponse> =>
  new Promise(resolve => {
    FoxpageApi.put('/resources/status', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

// /resources/folders
export const postResourcesFolders = (params: any): Promise<BaseResponse> =>
  new Promise(resolve => {
    FoxpageApi.post('/resources/folders', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const putResourcesFolders = (params: any): Promise<BaseResponse> =>
  new Promise(resolve => {
    FoxpageApi.put('/resources/folders', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });
// export const putResourcesFolderStatus = (params: any) =>
//   new Promise((resolve) => {
//     FoxpageApi.put('/resources/folder-status', params, (rs: any) => {
//       resolve(rs);
//     });
//   });

export const postResourcesGroups = (params: SaveResourcesGroupsRequestParams): Promise<BaseResponse> =>
  new Promise(resolve => {
    FoxpageApi.post('/resources/groups', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const getResourcesGroups = (params: any): Promise<BaseResponse> =>
  new Promise(resolve => {
    FoxpageApi.get('/resources/groups', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export interface GetResourcesGroupSearchsProps {
  applicationId: string;
  page?: number;
  size?: number;
}

export const getResourcesGroupSearchs = (params: GetResourcesGroupSearchsProps): Promise<BaseResponse> =>
  new Promise(resolve => {
    FoxpageApi.get('/resources/group-searchs', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export interface PutResourcesGroupStatusProps {
  applicationId: string;
  id: string;
  status: boolean;
}
export const putResourcesGroupStatus = (params: PutResourcesGroupStatusProps): Promise<BaseResponse> =>
  new Promise(resolve => {
    FoxpageApi.put('/resources/group-status', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

// /resources/versions
// export const getResourcesVersions = (params: any) =>
//   new Promise((resolve) => {
//     FoxpageApi.get('/resources/versions', params, (rs: any) => {
//       resolve(rs);
//     });
//   });

// /resources/by-paths
export const getResourcesByPaths = (params: {
  applicationId: string;
  path: string;
  depth?: number;
}): Promise<BaseResponse> =>
  new Promise(resolve => {
    FoxpageApi.get('/resources/by-paths', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

// cache 有缓存需求的请求
let ApiCache: Record<string, Promise<any>> = {};
export const getResourcesGroupSearchsWithCache = (params: { applicationId: string }) => {
  const cacheKey = `getResourcesGroupSearchs_${JsonStableStringify(params)}`;
  const { applicationId } = params;
  if (!ApiCache[cacheKey]) {
    ApiCache[cacheKey] = getResourcesGroupSearchs({
      applicationId,
      size: 999,
    }).then((res: BaseResponse<any>) => {
      if (res.code !== 200 || !res.data) {
        console.error(res.msg);
        return [];
      }
      return res.data || [];
    });
  }
  return ApiCache[cacheKey] as Promise<any[]>;
};

export const getResourcesByPathsWithCache = (params: { applicationId: string; path: string; depth?: number }) => {
  const cacheKey = `getResourcesByPaths_${JsonStableStringify(params)}`;
  const { applicationId, path, depth = 1 } = params;
  if (!ApiCache[cacheKey]) {
    ApiCache[cacheKey] = getResourcesByPaths({
      applicationId,
      path,
      depth,
    }).then((res: BaseResponse<any>) => {
      if (res.code !== 200) {
        console.error(res.msg);
        return {};
      }
      return res.data || {};
    });
  }
  return ApiCache[cacheKey] as Promise<{ children?: { folders: any[]; files: any[] } }>;
};

export const clearResourcesCache = () => {
  ApiCache = {};
};

export const editGroup = (params: SaveResourcesGroupsRequestParams): Promise<BaseResponse> =>
  new Promise(resolve => {
    FoxpageApi.put('/resources/group', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });
