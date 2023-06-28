import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

import { ResponseBase, ResponsePageBase } from './index-validate-types';

export class LogRequestContent {
  @JSONSchema({ description: 'user name' })
  @IsString()
  user: string;

  @JSONSchema({ description: 'Request time' })
  @IsNumber()
  requestTime: number;

  @JSONSchema({ description: 'Response time' })
  @IsNumber()
  responseTime: number;

  @JSONSchema({ description: 'Request tooks time, millisecond' })
  @IsNumber()
  tooks: number;

  @JSONSchema({ description: 'Application id' })
  @IsString()
  @IsOptional()
  applicationId: string;

  @JSONSchema({ description: 'Request parameter' })
  request: object;

  @JSONSchema({ description: 'Response data' })
  response: object;
}

export class LogDetail {
  @JSONSchema({ description: 'Log ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Log transaction id' })
  @IsString()
  transactionId: string;

  @JSONSchema({ description: 'Operator id' })
  @IsString()
  operator: string;

  @JSONSchema({ description: 'Operation action, request|update|remove...' })
  @IsString()
  action: string;

  @JSONSchema({ description: 'Operation action, request|update|remove...' })
  @Type(() => LogRequestContent)
  content: LogRequestContent;

  @JSONSchema({ description: 'Created time' })
  @IsDate()
  @IsOptional()
  createTime: Date;

  @JSONSchema({ description: 'Update time' })
  @IsDate()
  @IsOptional()
  updateTime: Date;

  @JSONSchema({ description: 'Delete status' })
  @IsBoolean()
  @IsOptional()
  deleted: Boolean;
}

export class WorkspaceDynamicListReq {
  @JSONSchema({ description: 'Organization Id' })
  @IsString()
  @Length(20, 20)
  organizationId: string;

  @JSONSchema({ description: 'Application ID to which the project belongs' })
  @IsString()
  @Length(20, 20)
  @IsOptional()
  applicationId: string;

  @JSONSchema({ description: 'Workspace type, user|application, default is user' })
  @IsString()
  @IsOptional()
  type: string;

  @JSONSchema({ description: 'Filter fields, currently only filter by organization name' })
  @IsString()
  @IsOptional()
  search: string;

  @JSONSchema({ description: 'Filter field, current page number' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page: number;

  @JSONSchema({ description: 'Filter fields, current data volume per page' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  size: number;

  @JSONSchema({ description: 'Filter fields, start time, millisecond' })
  @IsNumber()
  @IsOptional()
  startTime: number;

  @JSONSchema({ description: 'Filter fields, end time, millisecond' })
  @IsNumber()
  @IsOptional()
  endTime: number;
}

export class DynamicListRes extends ResponsePageBase {
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => LogDetail)
  data: Array<LogDetail>;
}

export class WorkspaceRequestReq {
  @JSONSchema({ description: 'Request transaction id' })
  @IsString()
  @Length(20, 20)
  transactionId: string;
}

export class RequestResData {
  @ValidateNested()
  @Type(() => LogDetail)
  request: LogDetail;

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => LogDetail)
  details: LogDetail;
}

export class RequestDetailsRes extends ResponseBase {
  @ValidateNested()
  @IsObject()
  data: RequestResData;
}

export class WorkspaceHistoryReq {
  @JSONSchema({ description: 'Request data id' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'Filter field, current page number' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page: number;

  @JSONSchema({ description: 'Filter fields, current data volume per page' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  size: number;
}
