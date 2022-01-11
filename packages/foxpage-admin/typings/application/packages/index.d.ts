import { GetComponentSearchsProps } from '@/apis/group/application/packages';
import { ComponentMetaType } from '@/types/builder';
import { FileTag } from '@/types/tag';
import { Creator } from '@/types/user';

export * from './detail';

export type PackageType = 'component' | 'editor' | 'library';

export interface AppComponentType {
  id: string;
  name: string;
  creator: {
    id: string;
    account: string;
  };
  type: string;
  createTime: string;
  updateTime: string;
  tags: Array<FileTag>;
}

export interface AppComponentInfoType {
  id: string;
  title: string;
  type: PackageType;
  fileId: string;
  tags: string[];
  creator: Creator;
  createTime: string;
  updateTIme: string;
  liveVersion: string;
  liveVersionNumber: string;
  online?: boolean;
}

export interface AppPackageSearchItem {
  applicationId: string;
  id: string;
  contentId: string;
  name: string;
  type: PackageType;
}

export interface AppComponentVersionType {
  id: string;
  contentId: string;
  fileId: string;
  creator: Creator;
  createTime: string;
  updateTIme: string;
  isLiveVersion: boolean;
  version: string;
  versionNumber: number;
  status: 'base' | 'discard' | 'release';
  content: {
    id?: string;
    meta: string;
    schema: string;
    resource?: {
      entry?: {
        browser?: string;
        debug?: string;
        node?: string;
        css?: string;
      },
      'editor-entry': { id: string; name: string; }[];
      dependencies: { id: string; name: string; }[];
    },
    useStyleEditor: boolean;
    enableChildren: boolean;
    changelog?: string;
  };
}

export interface ComponentVersionResource {
  entry: {
    browser?: {
      contentId: string;
      path: string;
    };
    node?: {
      contentId: string;
      path: string;
    };
    debug?: {
      contentId: string;
      path: string;
    };
    css?: {
      contentId: string;
      path: string;
    };
  },
  'editor-entry': { id: string; name: string; }[];
  dependencies: { id: string; name: string; }[];
}

export interface AppComponentEditVersionType {
  id: string;
  contentId: string;
  creator: string;
  createTime: string;
  updateTIme: string;
  version: string;
  versionNumber: number;
  status: 'base' | 'discard' | 'release';
  content: {
    id: string;
    meta: ComponentMetaType;
    schema: string;
    resource: ComponentVersionResource,
    useStyleEditor: boolean;
    enableChildren: boolean;
    changelog?: string;
  };
}

// type state
export interface AppComponentListUpdateState { }

// type api
export interface AppComponentFetchComponentsParams {
  applicationId?: string;
}
export interface AppComponentAddComponentParams {
  applicationId: string;
  name: string;
  type: GetComponentSearchsProps['type'];
}
export interface AppComponentDeleteComponentParams {
  applicationId: string;
  id: string;
}

