import { DynamicDataLevelEnum, DynamicDataTypeEnum } from '@/constants/workspace';
import {
  AbstractEntity,
  BaseFileEntity,
  CommonFetchParams,
  PaginationInfo,
  ResponseBody,
} from '@/types/index';

export interface DynamicContent extends Pick<AbstractEntity, 'id'> {
  name?: string;
  applicationName: string;
  dataLevel: DynamicDataLevelEnum;
  dataType: DynamicDataTypeEnum;
  originUrl: string;
  realMethod: string;
  request: {
    method: string;
    path: string;
    body: {
      [key: string]: unknown;
    };
  };
  requestTime: string;
  response: {
    code: number;
    data: {
      [key: string]: unknown;
    };
  };
  responseTime: string;
  tooks: number;
  user: string;
}

export interface DynamicEntity
  extends Pick<BaseFileEntity<DynamicContent>, 'content' | 'deleted' | 'id' | 'createTime' | 'updateTime'> {
  action: string;
  category: {
    id: string;
    type: string;
  };
  operator: string;
  transactionId: string;
}

export interface DynamicFetchParams extends CommonFetchParams {}

export interface DynamicFetchResponse extends ResponseBody {
  pageInfo: PaginationInfo;
  data: DynamicEntity[];
}
