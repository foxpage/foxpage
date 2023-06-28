import { ConditionEntity } from '../../condition';
import { FuncEntity } from '../../function';
import { VariableEntity } from '../../variable';
import { Content } from '../content';

/**
 * page structure node
 */
export interface StructureNode<P = Record<string, any>> {
  id: string;
  label: string;
  name: string;
  props: P;
  version: string;
  type: 'react.component' | 'dsl.template';
  children?: StructureNode[];
  extension: Extension;
  directive?: Directive;
  childIds?: string[];
  __parsedProps?: P;
}

export interface Extension {
  extendId?: string;
  sort?: number;
  parentId?: string;
  mockId?: string;
}

export interface Directive {
  [name: string]: string | Array<string> | undefined;
  tpl?: string;
  if?: string[];
}

export type Structure = StructureNode[];

/**
 * schema
 */
export interface Schemas<P = Record<string, any>> {
  id?: string;
  name: string;
  props: P;
  type?: string | number;
}

export interface RelationValue {
  content?: any;
  id?: string;
  name?: string;
  type: 'template' | 'variable' | 'condition' | 'sys_variable' | 'function' | 'block';
}

/**
 * relation
 */
export interface Relation {
  [key: string]: RelationValue;
}

type RelationKey = 'id' | 'relation' | 'schemas' | 'version' | 'name';

export interface RelationDetails {
  templates?: Content[];
  blocks?: Content[];
  variables?: Array<Pick<VariableEntity, RelationKey>>;
  conditions?: Array<Pick<ConditionEntity, RelationKey>>;
  functions?: Array<Pick<FuncEntity, RelationKey>>;
}

export interface RelationSearchOption {
  applicationId: string;
}
