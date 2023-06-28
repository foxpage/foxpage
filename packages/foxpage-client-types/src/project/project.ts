import { Application } from '../application';
import { AbstractEntity, FileTag } from '../common';
import { File } from '../project';

import { ContentEntity } from './content';

export interface ProjectEntity extends Pick<AbstractEntity, 'id' | 'createTime' | 'creator' | 'updateTime'> {
  application: Pick<Application, 'id' | 'name'>;
  applicationId?: string;
  deleted: boolean;
  folderPath: string;
  intro: string;
  name?: string;
  organization?: {
    id: string;
    name: string;
  };
  parentFolderId: string;
  tags: FileTag[];
  type?: string;
}

export interface ProjectSearchResult {
  folders: ProjectEntity[];
  files: File[];
  contents: ContentEntity[];
}

export interface ProjectSearchEntity {
  id: string;
  name: string;
  type: string;
  level: string;
  parent: {
    fileId?: string;
    fileName?: string;
    folderId?: string;
    folderName?: string;
  };
  application: {
    id: string;
    name: string;
  };
  organization: {
    id: string;
    name: string;
  };
  creator: {
    id: string;
    account: string;
    email: string;
    nickName: string;
  };
  createTime: string;
  updateTime: string;
}
