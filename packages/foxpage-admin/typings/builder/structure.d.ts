import { FuncContentItem } from '@/types/application/function';
import { VariableType } from '@/types/application/variable';
import { MockContent } from '@/types/builder/mock';

import { ConditionContentItem } from '../application/condition';

import { ComponentSourceType, ComponentType } from './component';

export interface Extension {
  extendId?: string;
  sort?: number;
  parentId?: string;
  mockId?: string;
}
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
  type?: string;
  meta?: string | ComponentMetaType;
  wrapper?: string;
  children: Array<ComponentStructure>;
  resource?: ComponentSourceType;
  schema?: ComponentSchemaType | string;
  position?: number;
  relation?: RelationType;
  props?: ComponentPropsType;
  mock?: ComponentPropsType;
  directive?: ComponentDirectiveType;
  isUpdate?: boolean;
  belongTemplate?: boolean;
  useStyleEditor?: boolean;
  enableChildren?: boolean;
  extension?: Extension;
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
  mock: MockContent;
}

export interface DslContent {
  id: string;
  schemas: ComponentStructure[];
  relation: RelationType;
  extension?: Pick<Extension, 'extendId' | 'mockId'>;
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

export interface ExtensionData {
  baseContent?: DslType;
  curContent?: DslType;
  baseStructureRecord?: StructureRecord;
  curStructureRecord?: StructureRecord;
}
