import { Creator } from '../user';

export interface ActionRecordItem {
  type?: 'page' | 'structure' | 'variable' | 'condition' | 'function';
  id?: string;
  content: Record<string, any> | string;
}

export interface RecordLog {
  id: string;
  action: number;
  content: ActionRecordItem[];
  createTime: number;
  creator?: Creator;
  reversible?: boolean;
}

export interface RecordStatus {
  structure: Record<string, any>;
  variable: Record<string, any>;
  condition: Record<string, any>;
  function: Record<string, any>;
}
