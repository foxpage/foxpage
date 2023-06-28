import {
  MockApiDataCommon,
  MockBuildDetailItem,
  MockCommon,
  MockFetchCommonItem,
  PaginationReqParams,
  ResponseBody,
} from '@foxpage/foxpage-client-types';

// add new
export interface MockNewParams extends Partial<MockCommon> {
  folderId: string;
  suffix?: string;
  contentId?: string;
  refresh?: boolean;
  pageContentId?: string;
}

export interface MockNewRes extends ResponseBody {
  data: MockApiDataCommon[];
}

// update
export interface MockUpdateParams extends MockCommon {
  id?: string;
  folderId?: string;
  suffix?: string;
  version?: string;
}
export interface MockUpdateRes extends ResponseBody {
  data: MockApiDataCommon[];
}

// fetch paging list
export interface MockFileFetchParams extends PaginationReqParams {
  applicationId: string;
}

export interface MockFileFetchRes extends ResponseBody {
  data: {
    list: MockFetchCommonItem[];
  };
}

// fetch build detail
export interface MockBuildDetailFetchParams {
  applicationId: string;
  id: string;
}

export interface MockBuildDetailFetchRes extends ResponseBody {
  data: MockBuildDetailItem;
}

export interface MockValueUpdateParams {
  applicationId: string;
  folderId: string;
  value: Record<string, unknown>;
}

// publish
export interface MockPublishParams {
  applicationId: string;
  id: string;
  status: string;
}
