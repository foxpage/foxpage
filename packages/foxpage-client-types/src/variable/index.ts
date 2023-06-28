import { Relation } from '../builder';
import { BaseFileEntity } from '../common';

export interface StaticVariableProps {
  type: string;
  value: { [name: string]: string };
}

export interface FunctionVariableProps {
  function: string;
  args: Array<string | { [name: string]: string }>;
}

// VariableContent
export interface VariableContentEntity {
  id: string;
  schemas: Array<{
    type: string;
    name: string;
    props: StaticVariableProps | FunctionVariableProps;
  }>;
  relation: Relation;
}

// VariableType
export interface VariableEntity extends BaseFileEntity<VariableContentEntity> {}
