import { PostComponentsVersionsProps, PutComponentsLiveVersionProps, PutComponentsVersionPublishProps, PutComponentsVersionsProps } from '@/apis/group/application/packages/index';
import { AppComponentEditVersionType } from '@/types/application';
import { BaseResponse, PaginationReqParams, ResponseBody } from '@/types/common';

import { RemoteResource } from '../resources';

import { ComponentVersionResource } from '.';

// type api
export interface AppComponentDetailFetchComponentInfoParams {
  applicationId: string;
  id: string;
}

export interface AppComponentDetailFetchComponentVersionsParams { }

export type AppComponentDetailAddComponentVersionParams = PostComponentsVersionsProps;
export type AppComponentDetailEditComponentVersionParams = PutComponentsVersionsProps;
export type AppComponentDetailUpdateComponentVersionStatueParams = PutComponentsVersionPublishProps;
export type AppComponentDetailLiveComponentVersionParams = PutComponentsLiveVersionProps;

export interface ComponentRemotesFetchParams {
  applicationId: string;
  groupId: string;
  id: string;
  name: string;
}

export interface RemoteComponentFetchParams extends PaginationReqParams {
  applicationId: string;
  groupId: string;
  name?: string;
}

export interface RemoteComponentFetchedRes extends ResponseBody<RemoteComponentItem[]> {
}

export interface ComponentRemoteSaveParams<T = ComponentRemote> {
  applicationId: string;
  components: T[];
}

// design is ugly
export interface EditorComponent {
  name: string;
  groupId: string;
  component: {
    id?: string;
    version?: string;
    content: {
      resource: {
        entry: {
          browser?: string;
          css?: string;
          debug?: string;
          node?: string;
          editor?: string;
        };
        ['editor-entry']?: any[];
      },
      meta: {};
      schema: {};
    };
  };
};

export type EditorComponentSaveParams = ComponentRemoteSaveParams<EditorComponent>;

export interface EditorComponentSavedRes extends BaseResponse<Record<string, string>> { };

export interface ComponentRemote {
  component: {
    content: {
      meta?: {},
      resource: ComponentVersionResource;
    };
    id: string;
    version: string;
  };
  resource: RemoteResource;
}

export interface RemoteComponentItem {
  lastVersion: AppComponentEditVersionType;
  components: ComponentRemote[];
}


export interface EditorBatchPublishParams {
  applicationId: string;
  idVersions: { id: string, version?: string }[];
}