import {
  AppComponentEditVersionType,
  AppPackageSearchItem,
  ComponentRemote,
  ComponentRemoteSaveParams,
  ComponentRemotesFetchParams,
  PackageType,
} from '@/types/application';
import { ComponentMetaType } from '@/types/builder';
import { BaseResponse, PaginationReqParams, ResponseBody } from '@/types/common';
import FoxpageApi from '@/utils/foxpage-api-sdk';

// components
// 新增组件
export const postComponents = (params: any) =>
  new Promise(resolve => {
    FoxpageApi.post('/components', params, (rs: unknown) => {
      resolve(rs);
    });
  });

// export const putComponents = (params: any) =>
//   new Promise((resolve) => {
//     FoxpageApi.put('/components', params, (rs: unknown) => {
//       resolve(rs);
//     });
//   });

// /components/status
// 删除组件
export const putComponentsStatus = (params: any) =>
  new Promise(resolve => {
    FoxpageApi.put('/components/status', params, (rs: unknown) => {
      resolve(rs);
    });
  });

// /component-searchs
export interface GetComponentSearchsProps extends PaginationReqParams {
  applicationId: string;
  type: PackageType;
}

// 查询组件列表
export const getComponentSearchs = (params: GetComponentSearchsProps): Promise<ResponseBody<AppPackageSearchItem[]>> =>
  new Promise(resolve => {
    FoxpageApi.get('/component-searchs', params, rs => {
      resolve(rs);
    });
  });

// /components/contents
// 获取组件详情
export const getComponentsContents = (params: any) =>
  new Promise(resolve => {
    FoxpageApi.get('/components/contents', params, (rs: unknown) => {
      resolve(rs);
    });
  });

// /components/versions
// 组件新增版本
export interface PostComponentsVersionsProps {
  applicationId: string;
  contentId: string;
  version: string;
  content: {
    resource: {
      entry: {
        browser: string;
        node: string;
        debug?: string;
        css?: string;
      };
      'editor-entry': { id: string; version?: string }[];
      dependencies: { id: string; version?: string }[];
    };
    meta?: ComponentMetaType;
    schema?: string;
    useStyleEditor: boolean;
    enableChildren: boolean;
    changelog?: string;
  };
}
export const postComponentsVersions = (params: PostComponentsVersionsProps): Promise<BaseResponse> =>
  new Promise(resolve => {
    FoxpageApi.post('/components/versions', params, rs => {
      resolve(rs);
    });
  });

export interface PutComponentsVersionsProps extends Omit<PostComponentsVersionsProps, 'contentId'> {
  applicationId: string;
  // version id
  id: string;
}
export const putComponentsVersions = (params: PutComponentsVersionsProps): Promise<BaseResponse> =>
  new Promise(resolve => {
    FoxpageApi.put('/components/versions', params, rs => {
      resolve(rs);
    });
  });

// /components/version-searchs
// 获取组件 version 列表
export interface GetComponentsVersionSearchsProps {
  applicationId: string;
  id: string;
  page?: number;
  size?: number;
}
export const getComponentsVersionSearchs = (params: GetComponentsVersionSearchsProps): Promise<BaseResponse> =>
  new Promise(resolve => {
    FoxpageApi.get('/components/version-searchs', params, rs => {
      resolve(rs);
    });
  });

// /components/version-publish
// 更新组件版本状态
export interface PutComponentsVersionPublishProps {
  applicationId: string;
  id: string;
  status: 'release' | 'discard';
}
export const putComponentsVersionPublish = (params: PutComponentsVersionPublishProps): Promise<BaseResponse> =>
  new Promise(resolve => {
    FoxpageApi.put('/components/version-publish', params, rs => {
      resolve(rs);
    });
  });

// /components/live-versions
// live 组件版本
export interface PutComponentsLiveVersionProps {
  applicationId: string;
  id: string;
  versionNumber: string;
}
export const putComponentsLiveVersion = (params: PutComponentsLiveVersionProps): Promise<BaseResponse> =>
  new Promise(resolve => {
    FoxpageApi.put('/components/live-versions', params, rs => {
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
): Promise<BaseResponse<AppComponentEditVersionType>> =>
  new Promise(resolve => {
    FoxpageApi.get('/components/edit-versions', params, rs => {
      resolve(rs);
    });
  });

export const searchComponentRemotes = (params: ComponentRemotesFetchParams): Promise<BaseResponse<ComponentRemote[]>> =>
  new Promise(resolve => {
    FoxpageApi.get('/components/remote', params, rs => {
      resolve(rs);
    });
  });

export const saveComponentRemote = (params: ComponentRemoteSaveParams): Promise<BaseResponse<ComponentRemote[]>> =>
  new Promise(resolve => {
    FoxpageApi.post('/components/batch', params, rs => {
      resolve(rs);
    });
  });
