import { RecordLog } from '../record';

export type History = RecordLog & {
  updateTime: string;
  version: string;
  versionNumber: number;
  contentId: string;
};

export type HistoryRecord = { histories: History[]; version: string };
