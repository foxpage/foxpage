import { DynamicDataLevelEnum, DynamicDataTypeEnum } from '@/constants/workspace';
import { PaginationInfo, PaginationReqParams, ResponseBody } from '@/types/common';
import { ProjectType } from '@/types/project';

export interface MyProjectSearchResult extends ResponseBody {
  pageInfo: PaginationInfo;
  data: ProjectType[];
}

export interface DynamicSearchResult extends ResponseBody {
  pageInfo: PaginationInfo;
  data: Dynamic[];
}

export interface DynamicFetchParams extends PaginationReqParams {
  organizationId: string;
}

export interface DynamicContent {
  id: string;
  name: string;
  requestTime: string;
  user: string;
  responseTime: string;
  applicationId: string;
  applicationName: string;
  dataType: DynamicDataTypeEnum;
  dataLevel: DynamicDataLevelEnum;
  originUrl: string;
  request: {
    method: string;
    path: string;
    body: {
      [key: string]: unknown;
    };
  };
  response: {
    code: number;
    data: {
      [key: string]: unknown;
    };
  };
  realMethod: string;
}

export interface Dynamic {
  id: string;
  transactionId: string;
  action: string;
  operator: string;
  createTime: string;
  updateTime: string;
  content: DynamicContent;
}
