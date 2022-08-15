import {
  AbstractEntity,
  Extension,
  FileType,
  Mock,
  Relation,
  RelationDetails,
  ResponseBody,
  StructureNode,
} from '@/types/index';

export interface Content {
  id: string;
  dslVersion: string;
  version: string;
  schemas: StructureNode[];
  relation: Relation;
  extension: Extension;
  mock?: Mock;
}

export interface PageContent extends AbstractEntity {
  contentId: string;
  deleted: boolean;
  dslVersion: string;
  status: string;
  version: string;
  versionNumber?: number;
  content: Content;
  mock: Mock;
  relations: RelationDetails;
}

// api data back up
export interface ExtensionData {
  baseContent?: PageContent;
  curContent?: PageContent;
  baseStructureRecord?: Record<string, StructureNode>;
  curStructureRecord?: Record<string, StructureNode>;
}

// fetch
export interface ContentFetchParams {
  applicationId: string;
  id: string;
  type?: FileType;
}

export interface ContentFetchedRes extends ResponseBody<PageContent> {}

export interface ContentSaveParams {
  id: string;
  content: Content;
  applicationId: string;
}

export interface ContentSavedRes extends ResponseBody<PageContent> {}

export interface ContentPublishParams {
  id: string;
  status: 'release';
  applicationId: string;
}

export interface ContentPublishedRes extends ResponseBody<PageContent> {}

export interface ContentCloneParams {
  applicationId: string;
  targetContentId: string;
  sourceContentId: string;
}
