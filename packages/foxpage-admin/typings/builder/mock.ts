import {
  Content,
  PaginationReqParams,
  Relation,
  RelationDetails,
  ResponseBody,
  StructureNode,
} from '@/types/index';

export interface Mock {
  enable: boolean;
  id?: string;
  relation?: Relation;
  schemas: StructureNode[];
  version?: string;
}

export interface MockStructure {
  props: Record<string, any>;
  id: string;
  status: boolean;
}

export interface MockInfo {
  id: string;
  status: boolean;
  content: {
    structures: MockStructure[];
  };
}

// common
export interface MockCommon {
  applicationId: string;
  name: string;
  content: MockContent;
  intro?: string;
  type?: string;
}

export interface MockApiDataCommon extends Pick<MockCommon, 'name' | 'intro' | 'applicationId' | 'type'> {
  id: string;
  suffix: string;
  folderId: string;
  creator: {
    id: string;
    account: string;
  };
  createTime: string;
  updateTime: string;
  deleted: boolean;
}

// add new
export interface MockNewParams extends Partial<MockCommon> {
  folderId: string;
  suffix?: string;
  contentId?: string;
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
export interface MockFetchCommonItem {
  id: string;
  contentId: string;
  version: string;
  versionNumber: number;
  content: Record<string, any>;
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

export interface MockBuildDetailItemContent extends Content {
  version: string;
}

export interface MockBuildDetailItem {
  content: MockBuildDetailItemContent;
  contentId: string;
  createTime: string;
  creator: string;
  deleted: boolean;
  id: string;
  relations: RelationDetails;
  status: string;
  updateTime: string;
  version: string;
  versionNumber: number;
}

export interface MockBuildDetailFetchRes extends ResponseBody {
  data: MockBuildDetailItem;
}

export interface MockContent {
  id?: string;
  schemas: Array<{
    id?: string;
    name: string;
    props: Record<string, unknown>;
  }>;
  relation?: Relation;
  enable?: boolean;
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
