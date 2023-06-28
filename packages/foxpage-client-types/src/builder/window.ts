import { RenderStructureNode } from './structure';

export type BuilderWindow =
  | 'variable'
  | 'variableBind'
  | 'condition'
  | 'conditionBind'
  | 'function'
  | 'page'
  | 'templateBind'
  | 'pageBind'
  | 'mockDelete';

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
  isMock?: boolean;
}

export interface ConditionBindParams extends WindowVisible {
  // component
  component: RenderStructureNode;
}

export interface ComponentMockDeleteParams {
  id: string;
}

export type BuilderWindowChangeOptions =
  | VariableBindParams
  | ConditionBindParams
  | WindowVisible
  | ComponentMockDeleteParams;
