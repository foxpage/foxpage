import {
  PaginationReqParams,
  PaginationResponseBody,
  RecordLog,
  ResponseBody,
} from '@foxpage/foxpage-client-types';

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

export interface RecordStatusFetchEdRes extends ResponseBody {
  data: {
    structure?: string[];
    variable?: string[];
    condition?: string[];
    function?: string[];
  };
}
