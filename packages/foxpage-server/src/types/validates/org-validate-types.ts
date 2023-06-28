import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  // IsNotEmpty,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

import { CreatorInfo, ResponseBase, ResponsePageBase } from './index-validate-types';

export class MemberBase {
  @JSONSchema({ description: 'User ID' })
  @IsString()
  userId: string;

  @JSONSchema({ description: 'User status: true: normal; false: left' })
  @IsBoolean()
  status: boolean;

  @JSONSchema({ description: 'User Name' })
  @IsString()
  @IsOptional()
  account: string;
}

export class Member extends MemberBase {
  @JSONSchema({ description: 'Join time' })
  @IsDate()
  joinTime: Date;
}

export class AddOrgDetailReq {
  @JSONSchema({ description: 'Organization Name' })
  @IsString()
  @Length(2, 100)
  name: string;
}

export class OrgUpdateDetailReq {
  @JSONSchema({ description: 'Organization ID' })
  @IsString()
  organizationId: string;

  @JSONSchema({ description: 'Organization Name' })
  @IsString()
  @Length(1, 100)
  name: string;
}

export class OrgDetail {
  @JSONSchema({ description: 'Organization ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Organization Name' })
  @IsString()
  name: string;

  @JSONSchema({ description: 'Organization Member' })
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  members: Member;

  @JSONSchema({ description: 'Organization Creator' })
  @IsObject()
  @ValidateNested()
  @IsOptional()
  creator: CreatorInfo;

  @JSONSchema({ description: 'organization creation time' })
  @IsDate()
  @IsOptional()
  createTime: Date;

  @JSONSchema({ description: 'Organization update time' })
  @IsDate()
  @IsOptional()
  updateTime: Date;

  @JSONSchema({ description: 'Organization deletion status' })
  @IsBoolean()
  @IsOptional()
  deleted: Boolean;
}

export class OrgBaseDetail {
  @JSONSchema({ description: 'Organization ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Organization Name' })
  @IsString()
  name: string;

  @JSONSchema({ description: 'Organization Member' })
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  members: string;

  @JSONSchema({ description: 'Organization Creator' })
  @IsObject()
  @ValidateNested()
  @IsOptional()
  creator: string;

  @JSONSchema({ description: 'organization creation time' })
  @IsDate()
  @IsOptional()
  createTime: Date;

  @JSONSchema({ description: 'Organization update time' })
  @IsDate()
  @IsOptional()
  updateTime: Date;

  @JSONSchema({ description: 'Organization deletion status' })
  @IsDate()
  @IsOptional()
  deleted: Boolean;
}

export class OrgDetailRes extends ResponseBase {
  @JSONSchema({ description: 'Organization Details' })
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  data: OrgDetail;
}

export class OrgBaseDetailRes extends ResponseBase {
  @JSONSchema({ description: 'Organization Details' })
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  data: OrgBaseDetail;
}

export class OrgListReq {
  @JSONSchema({ description: 'Filter fields, currently only filter by organization name' })
  @IsString()
  @IsOptional()
  search?: string;

  @JSONSchema({ description: 'Filter field, current page number' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @JSONSchema({ description: 'Filter fields, current data volume per page' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  size?: number;
}

export class OrgListRes extends ResponsePageBase {
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  data: OrgDetail;
}

export class OrgMemberDetailReq {
  @JSONSchema({ description: 'Organization ID' })
  @IsString()
  @Length(20, 20)
  organizationId: string;

  @JSONSchema({ description: 'Organization Member' })
  @ValidateNested({ each: true })
  @IsArray()
  @ArrayMinSize(1)
  members: MemberBase[];
}

export class AddOrgMembersReq {
  @JSONSchema({ description: 'Organization ID' })
  @IsString()
  @Length(20, 20)
  organizationId: string;

  @JSONSchema({ description: 'Organization member name' })
  @IsString()
  @Length(1, 100)
  @IsOptional()
  account: string;

  @JSONSchema({ description: 'Organization member id' })
  @IsString()
  @IsOptional()
  userId: string;
}

export class DeleteOrgMembersReq {
  @JSONSchema({ description: 'Organization ID' })
  @IsString()
  @Length(20, 20)
  organizationId: string;

  @JSONSchema({ description: 'Organization member ID' })
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  userIds: string[];
}

export class GetOrgMembersReq {
  @JSONSchema({ description: 'Organization ID' })
  @IsString()
  @Length(20, 20)
  organizationId: string;

  // @JSONSchema({ description:'Member Name' })
  // @IsString()
  // @IsOptional()
  // search: string;

  @JSONSchema({ description: 'Current page number' })
  @IsNumber()
  @IsOptional()
  page: number;

  @JSONSchema({ description: 'Number of data per page' })
  @IsNumber()
  @IsOptional()
  size: number;
}

export class OrgStatusReq {
  @JSONSchema({ description: 'Organization ID' })
  @IsString()
  @Length(20, 20)
  organizationId: string;

  @JSONSchema({ description: 'Organization State' })
  @IsBoolean()
  @IsOptional()
  status: boolean;
}

export class OrgDetailReq {
  @JSONSchema({ description: 'Organization ID' })
  @IsString()
  @Length(20, 20)
  id: string;
}
