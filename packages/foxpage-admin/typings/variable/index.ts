import {
  BaseResponse,
  CommonDeleteParams,
  CommonFetchParams,
  CommonPublishParams,
  FileScope,
  PaginationReqParams,
  VariableEntity,
} from '@foxpage/foxpage-client-types';

export interface VariableSearchParams extends PaginationReqParams {
  applicationId: string;
  id?: string;
  names: string[];
}

export interface VariableSaveParams {
  successCb?: () => void;
  folderId?: string;
  pageContentId?: string;
  applicationId: string;
}

export type VariableDeleteParams = CommonDeleteParams & {
  variable?: VariableEntity;
};

// GetApplicationVariableParams
export interface VariablesFetchParams extends Omit<CommonFetchParams, 'organizationId'> {
  folderId?: string;
  type?: string;
  scope?: FileScope;
}

export interface AppVariablesFetchResponse extends BaseResponse<VariableEntity> {
  list: VariableEntity[];
}

export type VariablePublishParams = CommonPublishParams;
