import {
  BaseResponse,
  CommonFetchParams,
  ComponentEditVersionEntity,
  ComponentsLiveVersionUpdateParams,
  ComponentsVersionPublishParams,
  ComponentsVersionSaveParams,
  ComponentsVersionUpdateParams,
  ComponentVersionEntityResource,
  RemoteResource,
} from '@/types/index';

// type api
export type AppComponentDetailFetchComponentInfoParams = Pick<CommonFetchParams, 'applicationId' | 'id'>;

export interface AppComponentDetailFetchComponentVersionsParams {}

export type AppComponentDetailAddComponentVersionParams = Partial<ComponentsVersionSaveParams>;
export type AppComponentDetailEditComponentVersionParams = ComponentsVersionUpdateParams;
export type AppComponentDetailUpdateComponentVersionStatueParams = ComponentsVersionPublishParams;
export type AppComponentDetailLiveComponentVersionParams = ComponentsLiveVersionUpdateParams;

export interface RemoteComponentFetchParams extends Omit<CommonFetchParams, 'organizationId'> {
  groupId: string;
  name?: string;
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
      };
      meta: {};
      schema: {};
    };
  };
}

export type EditorComponentSaveParams = ComponentRemoteSaveParams<EditorComponent>;

export interface EditorComponentSavedRes extends BaseResponse<Record<string, string>> {}

export interface ComponentRemote {
  component: {
    content: {
      meta?: {};
      resource: ComponentVersionEntityResource;
    };
    id: string;
    version: string;
  };
  resource: RemoteResource;
}

export interface RemoteComponentItem {
  lastVersion: ComponentEditVersionEntity;
  components: ComponentRemote[];
}

export interface EditorBatchPublishParams {
  applicationId: string;
  idVersions: { id: string; version?: string }[];
}
