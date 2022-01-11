import { RelationsType, RelationType } from '@/types/builder';
import { Creator } from '@/types/user';

import { FileTag, PaginationReqParams, ResponseBody } from '../common';

export declare interface ConditionFetchParams extends PaginationReqParams {
  applicationId: string;
  folderId?: string;
}

export declare interface ConditionContentSchemaChildrenPropsItem {
  key: string;
  operation: string;
  value: string;
}

export declare interface ConditionContentSchemaChildrenItem {
  type: string;
  props: ConditionContentSchemaChildrenPropsItem;
}

export declare interface ConditionContentSchemaItem {
  name: string;
  type: number;
  props?: any;
  children: ConditionContentSchemaChildrenItem[];
}

export declare interface ConditionContentItem {
  id?: string;
  schemas: ConditionContentSchemaItem[];
  relation?: RelationType;
}

export declare interface ConditionItem {
  contentId: string;
  folderId?: string;
  id: string;
  name: string;
  type: string;
  version?: string;
  content: ConditionContentItem;
  relations?: RelationsType;
  creator?: Creator;
  tags: Array<FileTag>;
}

export declare interface ConditionFetchRes extends ResponseBody {
  data: ConditionItem[];
  pageInfo: ResponsePageInfo;
}

export declare interface ConditionNewParams {
  name?: string;
  intro?: string;
  applicationId: string;
  folderId: string;
  type?: string;
  suffix?: string;
  content?: ConditionContentItem;
}

export declare interface ConditionCreatorItem {
  id: string;
  account: string;
}

export declare interface ConditionNewDataItem {
  id: string;
  name: string;
  intro: string;
  application: string;
  type: string;
  suffix: string;
  folderId: string;
  creator: ConditionCreatorItem;
  createTime: string;
  updateTime: string;
  contentId: string;
  deleted: boolean;
}

export declare interface ConditionNewRes extends ResponseBody {
  data: ConditionNewDataItem;
}

export declare interface ConditionUpdateParams {
  applicationId: string;
  id: string;
  name?: string;
  folderId?: string;
  content: ConditionContentItem;
  intro?: string;
  type?: string;
}

export declare interface ConditionUpdateRes extends ResponseBody {
  data: ConditionNewDataItem[];
}

export declare interface ConditionDeleteParams {
  applicationId: string;
  id: string;
  status: boolean;
}

export declare interface ConditionDeleteDataItem {
  creator: ConditionCreatorItem;
  contentId: string;
  version: string;
  versionNumber: string;
  status: string;
  content: ConditionContentItem;
  createTime: string;
  updateTime: string;
  deleted: boolean;
}

export declare interface ConditionDeleteRes extends ResponseBody {
  data: ConditionDeleteDataItem[];
}
