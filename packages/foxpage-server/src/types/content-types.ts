import {
  Component,
  ComponentDSL,
  Content,
  ContentStatus,
  ContentVersion,
  DSL,
  DslRelation,
  DslSchemas,
  File,
  FileTypes,
  Folder,
  Tag,
} from '@foxpage/foxpage-server-types';

import { Creator, Search } from './index-types';

export type SearchContentExist = Pick<Content, 'title' | 'fileId'>;
export type ContentInfo = Exclude<Content, 'creator'> & { version?: string; creator: Creator };
export type ContentVersionInfo = Exclude<ContentVersion, 'creator'> & { creator: Creator };
export type ContentVersionNumber = Pick<ContentVersion, 'contentId' | 'versionNumber'>;
export type ContentVersionString = Pick<ContentVersion, 'contentId' | 'version'>;
export type ContentLiveVersion = Pick<Content, 'id' | 'liveVersionNumber'>;
export type ContentTagLiveVersion = Pick<Content, 'id' | 'tags' | 'liveVersionNumber'>;
export type AppPackageDetail = Pick<ContentVersion, 'content' | 'version'> & { id: string; title: string };
export type UpdateContent = Partial<Pick<Content, 'title' | 'tags'>>;
export type TemplateDetail = Pick<Content, 'id' | 'title'> & { version?: ContentVersion };
export type PageBuildVersion = ContentVersion & { components: Component[] };
export type ContentSearch = Search & { fileId: string };
export type RelationContentInfo = Record<string, File[] | DSL[]>;
export type NewContentInfo = Pick<Content, 'title' | 'fileId' | 'tags' | 'creator'>;
export type ContentVersionWithLive = ContentVersion & { isLiveVersion?: boolean };
export type ContentCheck = Pick<Content, 'title' | 'fileId'>;
export type ContentInfoUrl = ContentInfo & { urls: string[] };
export type NameVersionContent = NameVersion & { content: DSL };
export type NameVersionPackage = NameVersion & { package?: ComponentDSL };
export type FolderFileContent = Folder | File | Content;

export interface SearchLatestVersion {
  contentId: string;
  deleted?: boolean;
}

export interface VersionSearch {
  contentId: string;
  status?: string;
  deleted?: boolean;
  versionNumber?: number;
}

export interface NameVersion {
  name: string;
  version?: string;
}

export interface AppNameVersion {
  applicationId: string;
  contentNameVersion: NameVersion[];
  type?: string;
}

export interface AppTypeContent {
  applicationId: string;
  type: FileTypes | FileTypes[];
  contentIds?: string[];
}

export interface TagContentData {
  id: string;
  tags: Tag[];
  content: DSL;
}

export interface PageContentData {
  id: string;
  schemas: DslSchemas[];
  relation: Record<string, DslRelation>;
}

export interface AppTag {
  applicationId: string;
  pathname: string;
  tags: Tag[];
}

export interface FileTagContent {
  fileIds: string[];
  tags: Tag[];
}

export interface PageContentSearch {
  applicationId: string;
  fileId: string;
  type: FileTypes;
  page: number;
  size: number;
  search?: string;
}

export interface UpdateTypeContent {
  applicationId: string;
  id: string;
  type: FileTypes;
  title?: string;
  tags?: Tag[];
}

export interface UpdateContentVersion {
  applicationId: string;
  id: string;
  content: DSL | ComponentDSL;
  version: string;
}

export interface RelationAssocContent {
  files: File[];
  contents: Content[];
  versions: ContentVersion[];
}

export interface TagVersionRelation {
  content: Content;
  contentInfo: RelationContentInfo;
}

export interface LiveContentVersion {
  applicationId: string;
  id: string;
  versionNumber: number;
}

export interface VersionPublish {
  applicationId: string;
  id: string;
  status: ContentStatus;
}

export interface PageContentRelations {
  content: DSL;
  relations: Record<string, DSL[]>;
}

export interface PageContentRelationInfos extends PageContentRelations {
  id: string;
  dependMissing?: string[];
  recursiveItem?: string;
}

export interface RelationsRecursive {
  relationList: ContentVersion[];
  dependence: Record<string, string[]>;
  recursiveItem: string;
  missingRelations: string[];
}

export interface ComponentRecursive {
  componentList: NameVersionContent[];
  dependence: Record<string, string[]>;
  recursiveItem: string;
  missingComponents: NameVersion[];
}

export interface CircleDepend {
  recursiveItem: string;
  dependencies: Record<string, string[]>;
}

export interface ContentScopeInfo {
  id: string;
  name: string;
  versionNumber: number;
  content: DSL;
  isLiveVersion?: boolean;
  relations?: Record<string, any[]>;
}

export interface FileContentAndVersion {
  id: string;
  name: string;
  type: string;
  version: string;
  versionNumber: number;
  contentId: string;
  content: DSL;
  relations?: Record<string, ContentVersion[]>;
}

export interface VersionCheckResult {
  code: number;
  data: DSL;
  msg?: string;
}
