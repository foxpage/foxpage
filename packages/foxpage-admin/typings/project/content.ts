import { AbstractEntity, CommonDeleteParams, File, PaginationReqParams, PaginationResponseBody } from '@/types/index';

export interface ContentEntity extends Pick<File, 'id' | 'type' | 'creator' | 'tags'> {
  title: string;
  fileId: string;
  fold?: boolean;
  urls: string[];
  isBase?: boolean;
  version?: string;
  extendId?: string;
  liveVersionNumber?: number;
}

export interface ProjectContentFetchParams extends Pick<ContentEntity, 'fileId'> {
  applicationId: string;
  fileType?: string;
}

export interface ProjectContentDeleteParams extends CommonDeleteParams {
  fileId?: string;
  fileType?: string;
}

export interface ProjectContentCopyParams extends Pick<ProjectContentFetchParams, 'applicationId'> {
  fileId?: string;
  fileType?: string;
  sourceContentId: string;
  targetContentLocales: Record<string, string>[];
}

export interface ProjectContentUpdateParams extends Pick<ProjectContentFetchParams, 'applicationId'> {
  content: ContentEntity;
}

export type ProjectContentOfflineParams = Pick<
  ProjectContentDeleteParams,
  'applicationId' | 'id' | 'fileType' | 'fileId'
>;

export interface ProjectContentSaveAsBaseParams
  extends Pick<ProjectContentOfflineParams, 'applicationId' | 'fileId'> {
  contentId: string;
}

// content history
export interface ContentVersionData extends AbstractEntity {
  contentId: string;
  version: string;
  isLive: boolean;
}

export interface ContentVersionDataFetchParams extends PaginationReqParams {
  applicationId: string;
  contentId: string;
  fileType?: string;
}

export interface ContentVersionDataFetchedRes extends PaginationResponseBody<ContentVersionData[]> {}

export interface ContentVersionDetailFetchParams {
  applicationId: string;
  versionId: string;
}