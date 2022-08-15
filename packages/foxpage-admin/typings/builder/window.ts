import { RenderStructureNode } from './structure';

export type BuilderWindow = 'variable' | 'variableBind' | 'condition' | 'conditionBind' | 'function' | 'page' | 'templateBind';

export interface WindowVisible {
  status?: boolean;
}

export interface VariableBindParams extends WindowVisible {
  // component
  component: RenderStructureNode;
  // keys
  keys: string;
  // options
  opt: {};
}

export interface ConditionBindParams extends WindowVisible {
  // component
  component: RenderStructureNode;
}

export type BuilderWindowChangeOptions = VariableBindParams | ConditionBindParams | WindowVisible;
