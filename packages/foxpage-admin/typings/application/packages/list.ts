import { AbstractEntity, CommonFetchParams, FileTag, PaginationReqParams } from '@/types/index';

export type PackageType = 'component' | 'editor' | 'library';

// AppComponentType
export interface ComponentEntity extends AbstractEntity {
  name: string;
  applicationId: string;
  base?: string;
  contentId: string;
  deleted?: boolean;
  folderId?: string;
  intro?: string;
  online?: boolean;
  release?: string;
  suffix?: string;
  tags: Array<FileTag>;
  type: PackageType;
}

// AppComponentInfoType
export interface ComponentInfoEntity
  extends Pick<ComponentEntity, 'id' | 'type' | 'tags' | 'createTime' | 'creator' | 'updateTime' | 'online'> {
  title: string;
  fileId: string;
  liveVersion: string;
  liveVersionNumber: string;
}

interface ComponentVersionEntityContent {
  id?: string;
  meta: string;
  schema: string;
  resource?: {
    entry?: {
      browser?: string;
      debug?: string;
      node?: string;
      css?: string;
    };
    'editor-entry': { id: string; name: string }[];
    dependencies: { id: string; name: string }[];
  };
  useStyleEditor?: boolean;
  enableChildren?: boolean;
  changelog?: string;
}

// AppComponentVersionType
export interface ComponentVersionEntity
  extends Pick<ComponentEntity, 'id' | 'contentId' | 'creator' | 'createTime' | 'updateTime'> {
  fileId: string;
  isLiveVersion: boolean;
  version: string;
  versionNumber: number;
  status: 'base' | 'discard' | 'release';
  content: ComponentVersionEntityContent;
}

export interface ComponentVersionEntity
  extends Omit<
    ComponentInfoEntity,
    'online' | 'tags' | 'title' | 'type' | 'liveVersion' | 'liveVersionNumber'
  > {
  content: ComponentVersionEntityContent;
  contentId: string;
  isLiveVersion: boolean;
  status: 'base' | 'discard' | 'release';
  version: string;
  versionNumber: number;
}

// EntryContent
interface ComponentVersionEntityResourceEntry {
  contentId: string;
  path: string;
}

// ComponentVersionResource
export interface ComponentVersionEntityResource {
  entry: {
    browser?: ComponentVersionEntityResourceEntry;
    node?: ComponentVersionEntityResourceEntry;
    debug?: ComponentVersionEntityResourceEntry;
    css?: ComponentVersionEntityResourceEntry;
    editor?: ComponentVersionEntityResourceEntry;
  };
  'editor-entry': { id: string; name: string }[];
  dependencies: { id: string; name: string }[];
}

// AppComponentEditVersionType
export interface ComponentEditVersionEntity
  extends Omit<ComponentVersionEntity, 'fileId' | 'isLiveVersion' | 'content'> {
  content: Omit<ComponentVersionEntityContent, 'resource'> & {
    resource: ComponentVersionEntityResource;
  };
}

// api related
export interface AppPackageSearchItem {
  applicationId: string;
  id: string;
  contentId: string;
  name: string;
  type: PackageType;
}

// GetComponentSearchsProps
export interface AppComponentFetchParams extends Omit<CommonFetchParams, 'id' | 'organizationId'> {
  type: PackageType;
}

export type AppComponentFetchComponentsParams = Pick<AppComponentFetchParams, 'applicationId'> &
  PaginationReqParams &
  Partial<Pick<AppComponentFetchParams, 'type'>>;

export interface AppComponentAddComponentParams
  extends Pick<AppComponentFetchParams, 'applicationId' | 'type'> {
  name: string;
}

export interface AppComponentDeleteComponentParams extends AppComponentFetchComponentsParams {
  id: string;
}

// GetComponentsVersionSearchsProps
export type ComponentsVersionFetchParams = AppComponentDeleteComponentParams & PaginationReqParams;

// PostComponentsVersionsProps
export type ComponentsVersionSaveParams = Pick<ComponentVersionEntity, 'contentId' | 'version' | 'content'> &
  Pick<AppComponentFetchParams, 'applicationId'>;

// PutComponentsLiveVersionProps
export type ComponentsLiveVersionUpdateParams = Pick<ComponentVersionEntity, 'id' | 'versionNumber'> &
  Pick<AppComponentFetchParams, 'applicationId'>;

// PutComponentsVersionPublishProps
export type ComponentsVersionPublishParams = Pick<ComponentVersionEntity, 'id' | 'status'> &
  Pick<AppComponentFetchParams, 'applicationId'>;

// PutComponentsVersionsProps
export type ComponentsVersionUpdateParams = Omit<ComponentsVersionSaveParams, 'contentId'> &
  Pick<AppComponentDeleteComponentParams, 'id'>;
