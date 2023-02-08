import { ResponseBody } from '../common';
import { RecordLog } from '../record';

export interface HistoryFetchParams {
  applicationId: string;
  contentId: string;
  versionId: string;
}

export interface HistoryFetchEdRes extends ResponseBody {
  data: History[];
}

export type History = RecordLog & {
  updateTime: string;
  version: string;
  versionNumber: number;
  contentId: string;
};

export type HistoryRecord = { histories: History[]; version: string };
