import {
  BaseFileEntity,
  BaseResponse,
  CommonDeleteParams,
  CommonFetchParams,
  CommonPublishParams,
  FileScope,
  PaginationReqParams,
  Relation,
} from '@/types/index';

export interface StaticVariableProps {
  type: string;
  value: { [name: string]: string };
}

export interface FunctionVariableProps {
  function: string;
  args: Array<string | { [name: string]: string }>;
}

// VariableContent
export interface VariableContentEntity {
  id: string;
  schemas: Array<{
    type: string;
    name: string;
    props: StaticVariableProps | FunctionVariableProps;
  }>;
  relation: Relation;
}

// VariableType
export interface VariableEntity extends BaseFileEntity<VariableContentEntity> {}

export interface VariableSearchParams extends PaginationReqParams {
  applicationId: string;
  id?: string;
  names: string[];
}

export interface VariableSaveParams {
  successCb?: () => void;
  folderId?: string;
  applicationId: string;
}

export type VariableDeleteParams = CommonDeleteParams;

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
