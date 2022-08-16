import {
  AbstractEntity,
  BaseFileEntity,
  BaseObjectEntity,
  CommonDeleteParams,
  CommonFetchParams,
  CommonPublishParams,
  FileScope,
  PaginationInfo,
  Relation,
  ResponseBody,
  Schemas,
} from '@/types/index';

export interface TimeZoneType extends BaseObjectEntity {
  desc: string;
  country: string;
}

export interface LocaleTimeZoneConfigType {
  [locale: string]: TimeZoneType[];
}

export interface ConditionFetchParams extends Omit<CommonFetchParams, 'organizationId'> {
  folderId?: string;
  type?: string;
  scope?: FileScope;
}

// ConditionContentSchemaChildrenPropsItem
export interface ConditionContentSchemaChildrenProps extends BaseObjectEntity {
  operation: string;
}

// ConditionContentSchemaChildrenItem
export interface ConditionContentSchemaChildren {
  type: string;
  props: ConditionContentSchemaChildrenProps;
}

// ConditionContentSchemaItem
export interface ConditionContentSchema extends Schemas<any> {
  children: ConditionContentSchemaChildren[];
}

// ConditionContentItem
export interface ConditionContentEntity extends Pick<AbstractEntity, 'id'> {
  relation?: Relation;
  schemas: ConditionContentSchema[];
}

// ConditionItem
export interface ConditionEntity extends Omit<BaseFileEntity<ConditionContentEntity>, 'type'> {
  type?: 'condition';
}

export interface ConditionFetchRes extends ResponseBody {
  data: ConditionEntity[];
  pageInfo: PaginationInfo;
}

// ConditionNewParams
export interface ConditionSaveParams
  extends Pick<ConditionEntity, 'applicationId' | 'intro' | 'name' | 'folderId' | 'suffix'> {
  content?: ConditionContentEntity;
  id?: string;
  type?: string;
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

export type ConditionDeleteParams = CommonDeleteParams;

export interface ConditionDeleteRes extends ResponseBody {
  // ConditionDeleteDataItem
  data: ConditionEntity[];
}

export type ConditionPublishParams = CommonPublishParams;

export type ConditionDetailFetchParams = Omit<CommonFetchParams, 'organizationId'>;
