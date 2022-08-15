import { CommonDeleteParams, File } from '@/types/index';

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

export interface ProjectContentUpdateParams extends Pick<ProjectContentFetchParams, 'applicationId'> {
  content: ContentEntity;
}
