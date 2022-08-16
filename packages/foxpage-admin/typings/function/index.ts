import {
  AbstractEntity,
  BaseFileEntity,
  CommonDeleteParams,
  CommonFetchParams,
  CommonPublishParams,
  FileScope,
  PaginationInfo,
  Relation,
  ResponseBody,
  Schemas,
} from '@/types/index';

// FuncContentSchemaPropsItem
export interface FuncContentSchemaProps {
  async: boolean;
  code: string;
}

// FuncContentSchemaItem
export type FuncContentSchema = Schemas<FuncContentSchemaProps>;

// FuncContentItem
export interface FuncContentEntity {
  id?: string;
  schemas: FuncContentSchema[];
  relation?: Relation;
}

// FuncItem
export interface FuncEntity extends BaseFileEntity<FuncContentEntity> {}

export interface FuncFetchParams extends Omit<CommonFetchParams, 'organizationId'> {
  folderId?: string;
  type?: string;
  scope?: FileScope;
}

export interface FuncFetchRes extends ResponseBody {
  data: FuncEntity[];
  pageInfo: PaginationInfo;
}

// FuncNewParams
export interface FuncSaveParams extends Pick<FuncFetchParams, 'applicationId' | 'folderId' | 'type'> {
  name?: string;
  id?: string;
  intro?: string;
  suffix?: string;
  content?: FuncContentEntity;
}

// FuncNewDataItem
export interface FuncNewData extends AbstractEntity {
  application: string;
  deleted: boolean;
  folderId: string;
  intro: string;
  suffix: string;
}

export interface FuncNewRes extends ResponseBody {
  data: FuncNewData[];
}

export interface FuncUpdateParams
  extends Pick<FuncSaveParams, 'applicationId' | 'content' | 'intro' | 'name' | 'type'> {
  id: string;
}

export interface FuncUpdateRes extends ResponseBody {
  data: FuncNewData[];
}

export type FuncDeleteParams = CommonDeleteParams;

// FuncDeleteDataItem
export interface FuncDeleteData extends Omit<FuncEntity, 'id' | 'tags' | 'type'> {
  deleted: boolean;
  status: string;
}

export interface FuncDeleteRes extends ResponseBody {
  data: FuncDeleteData[];
}

export type FuncPublishParams = CommonPublishParams;
