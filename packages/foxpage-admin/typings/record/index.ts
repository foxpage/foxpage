import { Creator, PaginationReqParams, PaginationResponseBody, ResponseBody } from '@/types/index';

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
}

export interface RecordSaveParams {
  applicationId: string;
  contentId: string;
  versionId?: string | number;
  logs: RecordLog[];
}

export interface RecordFetchParams extends PaginationReqParams {
  applicationId: string;
  contentId: string;
  versionId?: string;
  // single
  type?: string;
  typeId?: string;
}

export interface RecordFetchEdRes extends PaginationResponseBody {
  data: RecordLog[];
}

export interface RecordStatus {
  structure: Record<string, any>;
  variable: Record<string, any>;
  condition: Record<string, any>;
  function: Record<string, any>;
}

export interface RecordStatusFetchEdRes extends ResponseBody {
  data: {
    structure?: string[];
    variable?: string[];
    condition?: string[];
    function?: string[];
  };
}
