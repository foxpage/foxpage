import {
  AbstractEntity,
  Application,
  Component,
  Extension,
  File,
  FileType,
  Mock,
  Relation,
  RelationDetails,
  ResponseBody,
  StructureNode,
} from '@/types/index';

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

// fetch
export interface ContentFetchParams {
  applicationId: string;
  id: string;
  type?: FileType;
  // preview
  versionId?: string;
}

export interface ContentFetchedRes extends ResponseBody<PageContent> {}

export interface ContentSaveParams {
  id: string;
  content: Content;
  applicationId: string;
  contentUpdateTime?: string;
}

export interface ContentSavedRes extends ResponseBody<PageContent> {}

export interface ContentCreateParams {
  applicationId: string;
  content: Content;
  fileId: string;
  title: string;
}

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

export interface CheckDSLParams {
  applicationId: string;
  contentId: string;
  versionId: string;
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

export interface CheckDSLRes extends ResponseBody<CheckDSLMain> {}

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

export interface InitStateParams {
  application: Application;
  components: Component[];
  extendPage?: PageContent;
  file: File;
  locale?: string;
  rootNode?: StructureNode;
  parseInLocal?: boolean;
}

export interface ContentVersionsParams {
  applicationId: string;
  id: string;
}

export interface ContentVersion {
  id: string;
  contentId: string;
  version: string;
  createTime: string;
  creator: ContentCreator;
}

export interface ContentVersionRes extends ResponseBody {
  data: ContentVersion[];
}
