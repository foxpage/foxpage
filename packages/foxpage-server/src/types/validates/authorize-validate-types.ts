// import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  // IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  // Min,
  ValidateNested,
} from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

import {
  // ResponsePageBase
  CreatorInfo,
  ResponseBase,
} from './index-validate-types';

export class AuthorizeDetail {
  @JSONSchema({ description: 'Authorize ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @JSONSchema({ description: 'Type name' })
  @IsString()
  @Length(1, 50)
  type: string;

  @JSONSchema({ description: 'Type id' })
  @IsString()
  @Length(20, 20)
  typeId: string;

  @JSONSchema({ description: 'Target id' })
  @IsString()
  @Length(20, 20)
  targetId: string;

  @JSONSchema({ description: 'Authorize mask' })
  @IsNumber()
  mask: number;

  @JSONSchema({ description: 'Authorize creator' })
  @IsString()
  @Length(20)
  creator: string;

  @JSONSchema({ description: 'Create time' })
  @IsDate()
  @IsOptional()
  createTime: Date;

  @JSONSchema({ description: 'Update time' })
  @IsDate()
  @IsOptional()
  updateTime: Date;

  @JSONSchema({ description: 'deleted status' })
  @IsBoolean()
  @IsOptional()
  deleted: Boolean;
}

export class AddAuthReq {
  // @JSONSchema({ description: 'Application ID' })
  // @IsString()
  // @Length(20, 20)
  // applicationId: string;

  @JSONSchema({ description: 'Auth type' })
  @IsString()
  type: string;

  @JSONSchema({ description: 'Auth type id' })
  @IsString()
  @IsOptional()
  typeId: string;

  @JSONSchema({ description: 'Auth target ids' })
  @IsArray()
  targetIds: string[];

  @JSONSchema({ description: 'Auth mask' })
  @IsNumber()
  @IsOptional()
  mask: number;

  @JSONSchema({ description: 'Auth allow status, default is true' })
  @IsBoolean()
  @IsOptional()
  allow: boolean;
}

export class UpdateAuthReq {
  // @JSONSchema({ description: 'Application ID' })
  // @IsString()
  // @Length(20, 20)
  // applicationId: string;

  @JSONSchema({ description: 'Auth ids' })
  @IsArray()
  ids: string[];

  @JSONSchema({ description: 'Auth mask' })
  @IsNumber()
  mask: number;

  @JSONSchema({ description: 'Auth allow status, default is true' })
  @IsBoolean()
  @IsOptional()
  allow: boolean;
}

export class SetAuthStatusReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Auth ids' })
  @IsArray()
  ids: string[];
}

export class GetAuthReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Data type, folder|file|content ' })
  @IsString()
  type: string;

  @JSONSchema({ description: 'Data type id' })
  @IsString()
  @IsOptional()
  typeId: string;
}

export class AuthDetailRes extends ResponseBase {
  @JSONSchema({ description: 'Authorize details' })
  @ValidateNested()
  data: AuthorizeDetail;
}

export class AuthorizeBaseInfo {
  @JSONSchema({ description: 'Authorize ID' })
  @IsString()
  @IsOptional()
  id: string;

  @JSONSchema({ description: 'Type name' })
  @IsString()
  @Length(1, 50)
  type: string;

  @JSONSchema({ description: 'Type id' })
  @IsString()
  @Length(20, 20)
  typeId: string;

  @JSONSchema({ description: 'Target info' })
  @IsObject()
  @ValidateNested()
  target: CreatorInfo;

  @JSONSchema({ description: 'Authorize mask' })
  @IsNumber()
  mask: number;

  @JSONSchema({ description: 'Authorize creator' })
  @IsString()
  @Length(20)
  creator: string;

  @JSONSchema({ description: 'Create time' })
  @IsDate()
  @IsOptional()
  createTime: Date;

  @JSONSchema({ description: 'Update time' })
  @IsDate()
  @IsOptional()
  updateTime: Date;

  @JSONSchema({ description: 'deleted status' })
  @IsBoolean()
  @IsOptional()
  deleted: Boolean;
}

export class AuthInfoRes extends ResponseBase {
  @JSONSchema({ description: 'Authorize details' })
  @ValidateNested({ each: true })
  @IsArray()
  data: AuthorizeBaseInfo;
}
