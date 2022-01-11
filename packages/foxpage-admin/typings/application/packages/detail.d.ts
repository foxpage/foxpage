import { PostComponentsVersionsProps, PutComponentsLiveVersionProps, PutComponentsVersionPublishProps, PutComponentsVersionsProps } from '@/apis/group/application/packages/index';
import { AppComponentEditVersionType } from '@/types/application';

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

export interface ComponentRemoteSaveParams {
  applicationId: string;
  components: ComponentRemote[];
}

export interface ComponentRemote {
  component: {
    content: {
      resource: ComponentVersionResource;
    };
    id: string;
    version: string;
  };
  resource: {
    files: {
      cjs: {
        ['production.js']: string;
      };
      umd: {
        ['style.css']: string;
        ['editor.js']: string;
        ['development.js']: string;
        ['production.min.js']: string;
      }
    },
    groupId: string;
    groupName: string;
    isNew: boolean;
    name: string;
    resourceName: string;
    latestVersion: string;
    version: string;
  }
}

export interface ComponentRemoteSearchResponse {
  lastVersion: AppComponentEditVersionType;
  components: ComponentRemote[];
}
