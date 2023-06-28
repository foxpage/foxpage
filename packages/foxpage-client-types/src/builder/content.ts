import { AbstractEntity } from '../common';

import { Mock } from './mock';
import { Extension, Relation, RelationDetails, StructureNode } from './structure';

export interface Content {
  id: string;
  dslVersion?: string;
  version?: string;
  schemas: StructureNode[];
  relation: Relation;
  extension: Extension;
  mock?: Mock;
}

export interface ContentCreator {
  id: string;
  account: string;
  email: string;
  nickName: string;
}

export interface PageContent extends AbstractEntity {
  contentId: string;
  deleted: boolean;
  dslVersion: string;
  status: string;
  version: string;
  versionNumber?: number;
  liveVersionId?: string;
  content: Content;
  mock: Mock;
  relations: RelationDetails;
  contentUpdateTime: string;
  title?: string;
  id: string;
}

// api data back up
export interface ExtensionData {
  baseContent?: PageContent;
  curContent?: PageContent;
  baseStructureRecord?: Record<string, StructureNode>;
  curStructureRecord?: Record<string, StructureNode>;
}

export interface CheckDSLMain {
  versionId: string;
  contentId: string;
  extendId: string;
  structure: [
    {
      status: number;
      data: [
        {
          id: string;
          name?: string;
          label?: string;
        },
      ];
    },
  ];
  relation: Record<string, string>;
  publishStatus: boolean;
}

export enum PublishSteps {
  START_PUBLISH = 0,
  SAVE_BEFORE_PUBLISH = 1,
  CHECK_BEFORE_PUBLISH = 2,
  PUBLISH_CONTENT = 3,
  PUBLISHED = 4,
}

export enum PublishStatus {
  PROCESSING = 'process',
  FINISH = 'finish',
  ERROR = 'error',
}

export interface ContentVersion {
  id: string;
  contentId: string;
  version: string;
  createTime: string;
  creator: ContentCreator;
}
