import { PaginationReqParams, ResponseBody, User } from '@/types/index';

export interface AuthorizeCommon {
  id: string;
  type: string;
  typeId: string;
  mask: number;
  creator: string;
  createTime: string;
  updateTime: string;
  deleted: boolean;
}
export interface AuthorizeResCommon extends AuthorizeCommon {
  targetId: string;
}

// list
export interface AuthorizeListFetchParams {
  applicationId: string;
  type: string;
  typeId: string;
}
export interface AuthorizeListItem extends AuthorizeCommon {
  target: {
    id: string;
    account: string;
  };
}
export interface AuthorizeListFetchRes extends ResponseBody {
  data: AuthorizeListItem[];
}

// new
export interface AuthorizeAddParams {
  applicationId: string;
  type: string;
  typeId: string;
  targetIds: string[];
  mask: number;
  allow?: boolean;
}
export interface AuthorizeAddRes extends ResponseBody {
  data: AuthorizeResCommon;
}

// update
export interface AuthorizeUpdateParams {
  applicationId: string;
  ids: string[];
  mask: number;
  allow: boolean;
}
export interface AuthorizeUpdate extends AuthorizeCommon {
  targetId: string;
}
export interface AuthorizeUpdateRes extends ResponseBody {
  data: AuthorizeUpdate;
}

// delete
export interface AuthorizeDeleteParams {
  applicationId: string;
  ids: string[];
}

export interface AuthorizeDeleteRes extends ResponseBody {
  data: AuthorizeResCommon;
}

// all user
export interface AuthorizeUserFetchParams extends PaginationReqParams {}

export interface AuthorizeUserFetchRes extends ResponseBody {
  data: User[];
}
