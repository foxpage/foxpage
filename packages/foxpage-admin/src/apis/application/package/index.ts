import {
  AppComponentDetailAddComponentVersionParams,
  AppComponentDetailFetchComponentInfoParams,
  BaseResponse,
  ComponentDisabledSaveParams,
  ComponentEditVersionEntity,
  ComponentEntity,
  ComponentRemote,
  ComponentRemoteSaveParams,
  ComponentsLiveVersionUpdateParams,
  ComponentsReferLiveVersionUpdateParams,
  ComponentsVersionFetchParams,
  ComponentsVersionPublishParams,
  ComponentsVersionUpdateParams,
  ComponentUsedFetchParams,
  EditorBatchPublishParams,
  EditorComponentSaveParams,
  FilesFetchedResponse,
  FilesFetchParams,
  PackageType,
  PaginationReqParams,
  RemoteComponentFetchParams,
  RemoteComponentItem,
  ResponseBody,
} from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

// components
// 新增组件
export const postComponents = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.post('/components', params, (rs: unknown) => {
      resolve(rs);
    });
  });

// /components/status
// 删除组件
export const putComponentsStatus = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.put('/components/status', params, (rs: unknown) => {
      resolve(rs);
    });
  });

// 更新组件loadOnIgnite状态
export const putComponents = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.put('/components', params, (rs: unknown) => {
      resolve(rs);
    });
  });

// /component-searchs
export interface GetComponentSearchsProps extends PaginationReqParams {
  applicationId: string;
  type: PackageType;
}

// search components
export const getComponentSearchs = (
  params: GetComponentSearchsProps,
): Promise<ResponseBody<ComponentEntity[]>> =>
  new Promise((resolve) => {
    FoxPageApi.get('/component-searchs', params, (rs) => {
      resolve(rs);
    });
  });

// /components/contents
// 获取组件详情
export const getComponentsContents = (params: AppComponentDetailFetchComponentInfoParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/components/contents', params, (rs: unknown) => {
      resolve(rs);
    });
  });

// /components/versions
// 组件新增版本
export const postComponentsVersions = (
  params: AppComponentDetailAddComponentVersionParams,
): Promise<BaseResponse> =>
  new Promise((resolve) => {
    FoxPageApi.post('/components/versions', params, (rs) => {
      resolve(rs);
    });
  });

export const putComponentsVersions = (params: ComponentsVersionUpdateParams): Promise<BaseResponse> =>
  new Promise((resolve) => {
    FoxPageApi.put('/components/versions', params, (rs) => {
      resolve(rs);
    });
  });

// /components/version-searchs
// 获取组件 version 列表
export const getComponentsVersionSearchs = (params: ComponentsVersionFetchParams): Promise<BaseResponse> =>
  new Promise((resolve) => {
    FoxPageApi.get('/components/version-searchs', params, (rs) => {
      resolve(rs);
    });
  });

// /components/version-publish
// 更新组件版本状态
export const putComponentsVersionPublish = (params: ComponentsVersionPublishParams): Promise<BaseResponse> =>
  new Promise((resolve) => {
    FoxPageApi.put('/components/version-publish', params, (rs) => {
      resolve(rs);
    });
  });

// set component live version
export const putComponentsLiveVersion = (params: ComponentsLiveVersionUpdateParams): Promise<BaseResponse> =>
  new Promise((resolve) => {
    FoxPageApi.put('/components/live-versions', params, (rs) => {
      resolve(rs);
    });
  });

// set refer live version
export const putComponentsReferLiveVersion = (params: ComponentsReferLiveVersionUpdateParams): Promise<BaseResponse> =>
new Promise((resolve) => {
  FoxPageApi.put('/components/reference-live-versions', params, (rs) => {
    resolve(rs);
  });
});

// /components/edit-versions
// 获取组件编辑的详情数据
export interface GetComponentsEditVersionsProps {
  applicationId: string;
  id: string;
}
export const getComponentsEditVersions = (
  params: GetComponentsEditVersionsProps,
): Promise<BaseResponse<ComponentEditVersionEntity>> =>
  new Promise((resolve) => {
    FoxPageApi.get('/components/edit-versions', params, (rs) => {
      resolve(rs);
    });
  });

export const searchComponentRemotes = (
  params: RemoteComponentFetchParams,
): Promise<BaseResponse<ComponentRemote[]>> =>
  new Promise((resolve) => {
    FoxPageApi.get('/components/remote', params, (rs) => {
      resolve(rs);
    });
  });

export const fetchRemoteComponents = (
  params: RemoteComponentFetchParams,
): Promise<ResponseBody<RemoteComponentItem[]>> =>
  new Promise((resolve) => {
    FoxPageApi.get('/components/remote-searchs', params, (rs) => {
      resolve(rs);
    });
  });

export const saveComponentRemote = (
  params: ComponentRemoteSaveParams,
): Promise<BaseResponse<ComponentRemote[]>> =>
  new Promise((resolve) => {
    FoxPageApi.post('/components/batch', params, (rs) => {
      resolve(rs);
    });
  });

export const saveEditors = (params: EditorComponentSaveParams): Promise<BaseResponse<ComponentRemote[]>> =>
  new Promise((resolve) => {
    FoxPageApi.post('/components/editor-batch', params, (rs) => {
      resolve(rs);
    });
  });

export const batchPublishEditors = (params: EditorBatchPublishParams): Promise<BaseResponse> =>
  new Promise((resolve) => {
    FoxPageApi.put('/components/batch-live-versions', params, (rs) => {
      resolve(rs);
    });
  });

export const fetchComponentUsed = (params: ComponentUsedFetchParams): Promise<BaseResponse> =>
  new Promise((resolve) => {
    FoxPageApi.get('/components/used', params, (rs) => {
      resolve(rs);
    });
  });

// fetch info
export const fetchComponentDetail = (params: FilesFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.post('/components/files', params, (rs: FilesFetchedResponse) => {
      resolve(rs);
    });
  });

// disabled
export const saveComponentDisabled = (params: ComponentDisabledSaveParams): Promise<BaseResponse> =>
  new Promise((resolve) => {
    FoxPageApi.put('/components/deprecated', params, (rs) => {
      resolve(rs);
    });
  });
