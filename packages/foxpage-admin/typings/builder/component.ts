import { ComponentMetaType, ComponentStructure, DslOperateType } from '@/types/builder';
import { BaseResponse } from '@/types/common';

export interface ComponentSourceMapType {
  [name: string]: ComponentType;
}

export interface ComponentResource {
  host: string;
  path: string;
}

export interface ComponentSourceType {
  entry: {
    browser: ComponentResource;
    node: ComponentResource;
    debug?: ComponentResource;
    css?: ComponentResource;
  };
  dependencies: Array<{ id: string; name: string }>;
  'editor-entry': Array<{ id: string; name: string; version?: string }>;
}

export interface ComponentType {
  id?: string;
  name?: string;
  meta?: ComponentMetaType;
  schema?: string;
  type?: string;
  version?: string;
  resource?: ComponentSourceType;
  useStyleEditor?: boolean;
  enableChildren?: boolean;
  components?: ComponentType[];
}

export interface ComponentListFetchParams {
  applicationId: string;
}

export interface ComponentListResponse extends BaseResponse {
  data: ComponentStructure[];
}

export interface ComponentStaticDeleteParams {
  id: string;
  parentId?: string;
  type: DslOperateType;
  content: {
    id: string;
  };
  position?: number;
  requireLoad: boolean;
}

export interface ComponentStaticSaveParams extends ComponentStaticDeleteParams {
  content: ComponentStructure;
}
