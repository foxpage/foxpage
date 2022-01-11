import { TagType } from '@/types/application/tag';
import { ApplicationUrlParams,OptionsAction } from '@/types/index';
import { Creator } from '@/types/user';

export interface ContentType {
  id: string;
  title: string;
  fileId?: string;
  tags: TagType[];
  creator?: Creator;
  urls?: string[];
}

export interface ContentSearchParams {
  applicationId: string;
  fileId: string;
  search?: string;
}

export interface ContentDeleteParams extends OptionsAction {
  applicationId: string;
  id: string;
  status: boolean;
}

export interface ContentUpdateParams extends OptionsAction {
  applicationId: string;
  content: ContentType;
}

export interface ContentUrlParams extends ApplicationUrlParams {
  fileId: string;
}
