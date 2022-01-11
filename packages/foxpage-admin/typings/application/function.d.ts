import { FileTag } from '@/types/tag';
import { Creator } from '@/types/user';

import { PaginationReqParams, ResponseBody } from '../common';

export declare interface FuncFetchParams extends PaginationReqParams {
  applicationId: string;
  folderId?: string;
}

export declare interface FuncContentSchemaPropsItem {
  async: boolean;
  code: string;
}

export declare interface FuncContentSchemaItem {
  name: string;
  type: string;
  props: FuncContentSchemaPropsItem;
}

export declare interface FuncContentItem {
  id?: string;
  schemas: FuncContentSchemaItem[];
  relation?: any;
}

export declare interface FuncItem {
  contentId: string;
  id: string;
  name: string;
  type: number;
  version: string;
  content: FuncContentItem;
  creator: Creator;
  tags: FileTag[];
}

export declare interface FuncFetchRes extends ResponseBody {
  data: FuncItem[];
  pageInfo: ResponsePageInfo;
}

export declare interface FuncNewParams {
  name?: string;
  intro?: string;
  applicationId: string;
  folderId: string;
  type?: string;
  suffix?: string;
  content?: FuncContentItem;
}

export declare interface FuncCreatorItem {
  id: string;
  account: string;
}

export declare interface FuncNewDataItem {
  id: string;
  name: string;
  intro: string;
  application: string;
  type: string;
  suffix: string;
  folderId: string;
  creator: FuncCreatorItem;
  createTime: string;
  updateTime: string;
  deleted: boolean;
}

export declare interface FuncNewRes extends ResponseBody {
  data: FuncNewDataItem[];
}

export declare interface FuncUpdateParams {
  applicationId: string;
  id: string;
  name?: string;
  content: FuncContentItem;
  intro?: string;
  type?: string;
}

export declare interface FuncUpdateRes extends ResponseBody {
  data: FuncNewDataItem[];
}

export declare interface FuncDeleteParams {
  applicationId: string;
  id: string;
  status: boolean;
}

export declare interface FuncDeleteDataItem {
  creator: FuncCreatorItem;
  contentId: string;
  version: string;
  versionNumber: string;
  status: string;
  content: FuncContentItem;
  createTime: string;
  updateTime: string;
  deleted: boolean;
}

export declare interface FuncDeleteRes extends ResponseBody {
  data: FuncDeleteDataItem[];
}
