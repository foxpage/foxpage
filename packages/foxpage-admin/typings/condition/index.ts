import {
  CommonDeleteParams,
  CommonFetchParams,
  CommonPublishParams,
  ConditionContentEntity,
  ConditionEntity,
  FileScope,
  PaginationInfo,
  ResponseBody,
} from '@foxpage/foxpage-client-types';

export interface ConditionFetchParams extends Omit<CommonFetchParams, 'organizationId'> {
  folderId?: string;
  type?: string;
  scope?: FileScope;
}

export interface ConditionFetchRes extends ResponseBody {
  data: ConditionEntity[];
  pageInfo: PaginationInfo;
}

// ConditionNewParams
export interface ConditionSaveParams
  extends Pick<ConditionEntity, 'applicationId' | 'intro' | 'name' | 'folderId' | 'suffix'> {
  content?: ConditionContentEntity & {
    version?: string;
  };
  id?: string;
  type?: string;
  subType?: string;
  pageContentId?: string;
}

// ConditionNewRes
export interface ConditionSaveResponse extends ResponseBody {
  // ConditionNewDataItem
  data: ConditionEntity;
}

export type ConditionUpdateParams = Omit<ConditionSaveParams, 'suffix'>;

export interface ConditionUpdateRes extends ResponseBody {
  data: ConditionEntity[];
}

export type ConditionDeleteParams = CommonDeleteParams & {
  condition?: ConditionEntity;
};

export interface ConditionDeleteRes extends ResponseBody {
  // ConditionDeleteDataItem
  data: ConditionEntity[];
}

export type ConditionPublishParams = CommonPublishParams;

export type ConditionDetailFetchParams = Omit<CommonFetchParams, 'organizationId'>;
