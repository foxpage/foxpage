import { Log } from '@foxpage/foxpage-server-types';

import { PageSize } from './index-types';

export type NewLog = Pick<Log, 'action' | 'category' | 'content'> & { operator?: string };

export interface ContentChange {
  applicationId: string;
  timestamp: number;
}

export interface UserOperationParams {
  operator: string;
  startTime: number;
  endTime: number;
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
