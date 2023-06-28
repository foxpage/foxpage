import { Content } from './content';
import { Relation, RelationDetails, StructureNode } from './structure';

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

export interface MockContentSchemaItem {
  id?: string;
  name: string;
  props: Record<string, unknown>;
  type?: string;
}
export interface MockContent {
  id?: string;
  schemas: Array<MockContentSchemaItem>;
  relation?: Relation;
  enable?: boolean;
}

export interface MockFetchCommonItem {
  id: string;
  contentId: string;
  version: string;
  versionNumber: number;
  content: Record<string, any>;
}
