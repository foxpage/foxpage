import { PaginationReqParams, ResponseBody } from '@/types/common';
import { OptionsAction } from '@/types/index';

import { ApplicationType, CreatorType } from '../../src/pages/common';

export interface ProjectProp {
  id: string;
  name: string;
  intro: string;
  application: ApplicationType;
  creator: CreatorType;
}

export interface FileTag {

  [name: string]: string;

}

export interface FileType {
  id: string;
  name: string;
  intro: string;
  applicationId: string;
  creator: CreatorType;
  type: string;
  suffix: string;
  folderId: string;
  folderName?: string;
  creator: string;
  createTime: string;
  updateTime: string;
  deleted: boolean;
  tags: FileTag[];
  online?: boolean;
}

export interface FolderType {
  id: string;
  name: string;
  intro: string;
  applicationId: string;
  creator: CreatorType;
  type: string;
  folderPath: string;
  parentFolderId: string;
  creator: string;
  createTime: string;
  updateTime: string;
  deleted: boolean;
}

export interface FileSearchParams extends PaginationReqParams {
  applicationId: string;
}

export interface FileDeleteParams extends OptionsAction {
  applicationId: string;
  id: string;
}

export interface FileUpdateParams extends OptionsAction {
  applicationId: string;
  file: FileType;
}

export interface FileDetailFetchParams {
  applicationId: string;
  ids: string[];
}

export interface FileUpdateReqParams {
  id: string;
  name: string;
  folderId: string;
  applicationId: string;
  tags: FileTag[];
  suffix: string;
  type: string
}
export interface FileResponse extends ResponseBody {
  data: FileType[];
  pageInfo: ResponsePageInfo;
}
