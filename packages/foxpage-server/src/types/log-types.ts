import { Log } from '@foxpage/foxpage-server-types';

import { PageSize } from './index-types';

export type NewLog = Pick<Log, 'action' | 'category' | 'content'> & { operator?: string };

export interface ContentChange {
  applicationId: string;
  timestamp: number;
}

export interface UserOperationParams {
  creator: string;
  startTime: number;
  endTime: number;
  type: string;
  organizationId?: string;
  applicationId?: string;
  action?: string;
  page?: number;
  size?: number;
}

export interface DataLogPage extends PageSize {
  id: string;
}

export interface LogOptionItems {
  id?: string;
  type?: string;
  method?: string;
}

export interface LogContent {
  id: string;
  type: string;
  content: any;
}

export interface ContentLogItem {
  action: string;
  content: LogContent[];
  createTime?: number;
  structureId?: string;
}

export interface UserLogItem {
  actionType: string;
  content: any[];
  createTime?: number;
  structureId?: string;
}
