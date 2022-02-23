import { FuncItem } from '@/types/application/function';
import { VariableType } from '@/types/application/variable';

import { ConditionContentItem } from '../application/condition';

import { ComponentSourceType,ComponentType } from './component';

export interface ComponentMetaType {
  notRender?: boolean;
  decorated?: boolean;
}

export interface ComponentSchemaType {
  required: string[];
  properties: {
    [key: string]: {
      type: string;
      description?: string;
    };
  };
}

export interface ComponentDirectiveType {
  [name: string]: string | Array<string> | undefined;
}

export interface ComponentPropsType {
  [name: string]: string | ComponentPropsType;
}

export interface ComponentStructure {
  id: string;
  parentId?: string;
  version?: string;
  name: string;
  label?: string;
  type: string;
  meta?: ComponentMetaType;
  wrapper?: string;
  children: Array<ComponentStructure>;
  resource?: ComponentSourceType;
  schema?: ComponentSchemaType;
  meta?: string;
  position?: number;
  relation?: RelationType;
  props?: ComponentPropsType;
  directive?: ComponentDirectiveType;
  isUpdate?: boolean;
  belongTemplate?: boolean;
  useStyleEditor?: boolean;
  enableChildren?: boolean;
}

export interface componentSourceType {
  [name: string]: ComponentType;
}

export interface RelationsType {
  templates?: ComponentStructure[];
  variables?: VariableType[];
  conditions?: ConditionContentItem[];
  functions?: FuncContentItem[];
}

export interface DslType {
  id: string;
  contentId: string;
  versionNumber?: number;
  components: ComponentType[];
  content: DslContent;
  relations: RelationsType;
}

export interface DslContent {
  id: string;
  schemas: ComponentStructure[];
  relation: RelationType;
}

export interface RelationType {
  [name: string]: {
    id: string;
    name?: string;
    type: 'template' | 'variable' | 'condition' | 'sys_variable';
    content?: ComponentStructure | ConditionContentItem | VariableType;
  };
}

export interface Template {
  id: string;
  title: string;
  content: DslType;
}

export interface DslUpdateParams {
  applicationId: string;
  id: string;
  content: DslContent;
}

export interface DslFetchParams {
  applicationId: string;
  id: string;
}

export interface DslFetchResponse extends BaseResponse {
  data: DslType;
}

export interface TemplateFetchResponse extends BaseResponse {
  data: Template[];
}

export interface DslError {
  [componentId: string]: string[];
}

export interface ComponentSaveParams {
  applicationId: string;
  folderId: string;
  isWrapper: boolean;
}

export interface ComponentAddParams {
  type: 'insert' | 'append';
  componentId: string;
  pos: string;
  desc: ComponentStructure;
  parentId: string;
}