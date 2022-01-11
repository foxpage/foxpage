import { ProjectContentTag, ProjectContentType } from '@/types/application/project';
import { OptionsAction } from '@/types/index';
import { Creator } from '@/types/user';

export interface OffsetType {
  scrollX: number;
  scrollY: number;
}

export interface PageParam {
  applicationId: string;
  folderId?: string;
  fileId?: string;
  contentId: string;
  locale?: string;
  fileType: string;
}

export interface PageContentType extends ProjectContentType {
  folderId: string;
  fold: boolean;
  name: string;
  contents?: PageContentType[];
}

export interface PageFileType {
  id: string;
  applicationId: string;
  folderId: string;
  name: string;
  title: string;
  fileId: string;
  type: string;
  fold: boolean;
  tags: ProjectContentTag[];
  creator: Creator;
  contents?: PageContentType[];
}

export type DslOperateType = 'add' | 'update' | 'move' | 'delete';

export interface PagePublishParams {
  applicationId: string;
  id: string;
  status: string;
}

export interface PageCloneParams extends OptionsAction {
  applicationId: string;
  targetContentId: string;
  sourceContentId: string;
}
