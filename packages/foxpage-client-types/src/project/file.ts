import { Application } from '../application';
import { AbstractEntity, FileTag } from '../common';
import { ComponentType } from '../enums';

export interface ProjectFile extends Pick<AbstractEntity, 'id' | 'createTime' | 'creator' | 'updateTime'> {
  name: string;
  applicationId: string;
  folderId: string;
}

export interface File extends Pick<ProjectFile, 'id' | 'createTime' | 'creator' | 'folderId' | 'updateTime'> {
  application: Pick<Application, 'id' | 'name'>;
  deleted: boolean;
  deprecated: boolean;
  intro: string;
  name: string;
  suffix: string;
  tags: FileTag[];
  type: FileType;
  componentType: ComponentType;
  online?: boolean;
  hasContent: boolean;
  hasLiveContent?: boolean;
  applicationId?: string;
}

export type FileType =
  | 'page'
  | 'template'
  | 'variable'
  | 'mock'
  | 'condition'
  | 'function'
  | 'component'
  | 'editor'
  | 'systemComponent'
  | 'block';

// parent file
export interface ParentFile extends Pick<File, 'id' | 'name' | 'deleted'> {
  folderPath: string;
}

export type FileScope = 'application' | 'project';
