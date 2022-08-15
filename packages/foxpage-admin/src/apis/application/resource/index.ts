import JsonStableStringify from 'json-stable-stringify';

import {
  ApplicationResourceGroupTypeEntity,
  ApplicationResourcesAllGroupsFetchParams,
  ApplicationResourcesFetchParams,
  ApplicationResourcesGroupDeleteParams,
  ApplicationResourcesRemoteUrlFetchParams,
  BaseResponse,
  RemoteResourceSavedRes,
  RemoteResourceSaveParams,
  ResourcesGroupConfigUpdateParams,
  ResourceUrlFetchedRes,
} from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

// getApplicationsResources
export const fetchApplicationsResourcesGroupTypes = (
  params: ApplicationResourcesFetchParams,
): Promise<BaseResponse<ApplicationResourceGroupTypeEntity[]>> =>
  new Promise((resolve) => {
    FoxPageApi.get(
      '/applications/resources',
      params,
      (rs: BaseResponse<ApplicationResourceGroupTypeEntity[]>) => {
        resolve(rs);
      },
    );
  });

export const postResourcesContents = (params: any): Promise<BaseResponse> =>
  new Promise((resolve) => {
    FoxPageApi.post('/resources/contents', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const putResourcesContents = (params: any): Promise<BaseResponse> =>
  new Promise((resolve) => {
    FoxPageApi.put('/resources/contents', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const putResourcesStatus = (params: any): Promise<BaseResponse> =>
  new Promise((resolve) => {
    FoxPageApi.put('/resources/status', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const postResourcesFolders = (params: any): Promise<BaseResponse> =>
  new Promise((resolve) => {
    FoxPageApi.post('/resources/folders', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const putResourcesFolders = (params: any): Promise<BaseResponse> =>
  new Promise((resolve) => {
    FoxPageApi.put('/resources/folders', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const getResourcesGroups = (params: any): Promise<BaseResponse> =>
  new Promise((resolve) => {
    FoxPageApi.get('/resources/groups', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

// getResourcesGroupSearchs
export const fetchResourcesGroups = (
  params: ApplicationResourcesAllGroupsFetchParams,
): Promise<BaseResponse> =>
  new Promise((resolve) => {
    FoxPageApi.get('/resources/group-searchs', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

// postResourcesGroups
export const addResourcesGroup = (params: ResourcesGroupConfigUpdateParams): Promise<BaseResponse> =>
  new Promise((resolve) => {
    FoxPageApi.post('/resources/groups', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

// putResourcesGroupStatus
export const deleteResourcesGroup = (params: ApplicationResourcesGroupDeleteParams): Promise<BaseResponse> =>
  new Promise((resolve) => {
    FoxPageApi.put('/resources/group-status', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

// editGroup
export const updateGroupConfig = (params: ResourcesGroupConfigUpdateParams): Promise<BaseResponse> =>
  new Promise((resolve) => {
    FoxPageApi.put('/resources/group', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const fetchResourceRemoteUrl = (
  params: ApplicationResourcesRemoteUrlFetchParams,
): Promise<ResourceUrlFetchedRes> =>
  new Promise((resolve) => {
    FoxPageApi.get('/resources/remote-url', params, (rs: ResourceUrlFetchedRes) => {
      resolve(rs);
    });
  });

export const getResourcesByPaths = (params: {
  applicationId: string;
  path: string;
  depth?: number;
}): Promise<BaseResponse> =>
  new Promise((resolve) => {
    FoxPageApi.get('/resources/by-paths', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

let ApiCache: Record<string, Promise<any>> = {};
export const getResourcesGroupSearchsWithCache = (params: { applicationId: string }) => {
  const cacheKey = `getResourcesGroupSearchs_${JsonStableStringify(params)}`;
  const { applicationId } = params;
  if (!ApiCache[cacheKey]) {
    ApiCache[cacheKey] = fetchResourcesGroups({
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

export const getResourcesByPathsWithCache = (params: {
  applicationId: string;
  path: string;
  depth?: number;
}) => {
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

export const saveResourceBatch = (params: RemoteResourceSaveParams): Promise<RemoteResourceSavedRes> =>
  new Promise((resolve) => {
    FoxPageApi.post('/resources/batch', params, (rs: RemoteResourceSavedRes) => {
      resolve(rs);
    });
  });
