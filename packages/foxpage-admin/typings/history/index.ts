import { ResponseBody } from '@foxpage/foxpage-client-types';

export interface HistoryFetchParams {
  applicationId: string;
  contentId: string;
  versionId: string;
}

export interface HistoryFetchEdRes extends ResponseBody {
  data: History[];
}
