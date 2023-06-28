import {
  AuthorizeCommon,
  AuthorizeResCommon,
  CommonFetchParams,
  Creator,
  PaginationReqParams,
  ResponseBody,
  User,
} from '@foxpage/foxpage-client-types';

// list
export type AuthorizeListFetchParams = Pick<AuthorizeCommon, 'type' | 'typeId'> &
  Pick<CommonFetchParams, 'applicationId'>;

export interface AuthorizeListItem extends AuthorizeCommon {
  target: Omit<Creator, 'nickName'>;
}

export interface AuthorizeListFetchResponse extends ResponseBody {
  data: AuthorizeListItem[];
}

// new
export interface AuthorizeAddParams extends AuthorizeListFetchParams {
  targetIds: string[];
  mask: number;
  allow?: boolean;
}

export interface AuthorizeAddResponse extends ResponseBody {
  data: AuthorizeResCommon;
}

// update
export interface AuthorizeUpdateParams extends Pick<AuthorizeAddParams, 'applicationId' | 'mask' | 'allow'> {
  ids: string[];
}

export interface AuthorizeUpdateResponse extends ResponseBody {
  data: AuthorizeResCommon;
}

// delete
export type AuthorizeDeleteParams = Pick<AuthorizeUpdateParams, 'applicationId' | 'ids'>;

export interface AuthorizeDeleteResponse extends ResponseBody {
  data: AuthorizeResCommon;
}

// check
export interface AuthorizeQueryParams {
  applicationId: string;
  type: string;
  typeId?: string;
}

// all user
export interface AuthorizeUserFetchParams extends PaginationReqParams {}

export interface AuthorizeUserFetchRes extends ResponseBody {
  data: User[];
}
