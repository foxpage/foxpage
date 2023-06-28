import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
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
}

export class Member extends MemberBase {
  @JSONSchema({ description: 'Join time' })
  @IsDate()
  joinTime: Date;
}

export class TeamListReq {
  @JSONSchema({ description: 'Organization ID' })
  @IsString()
  @Length(20, 20)
  @IsNotEmpty()
  organizationId: string;

  @JSONSchema({ description: 'Filter fields, currently only filtered by team name' })
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
}

export class AddTeamDetailReq {
  @JSONSchema({ description: 'Team name' })
  @IsString()
  @Length(1, 100)
  name: string;

  @JSONSchema({ description: 'The ID of the organization to which the team belongs' })
  @IsString()
  @Length(20, 20)
  organizationId: string;
}

export class TeamBaseDetail {
  @JSONSchema({ description: 'Team ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Team name' })
  @IsString()
  name: string;

  @JSONSchema({ description: 'team member' })
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  members: string;

  @JSONSchema({ description: 'Team creator' })
  @IsString()
  @ValidateNested()
  @IsOptional()
  creator: string;

  @JSONSchema({ description: 'Team creation time' })
  @IsDate()
  @IsOptional()
  createTime: Date;

  @JSONSchema({ description: 'Team update time' })
  @IsDate()
  @IsOptional()
  updateTime: Date;

  @JSONSchema({ description: 'Team deletion status' })
  @IsBoolean()
  @IsOptional()
  deleted: Boolean;
}

export class TeamDetail {
  @JSONSchema({ description: 'Team ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Team name' })
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

  @JSONSchema({ description: 'Team creation time' })
  @IsDate()
  @IsOptional()
  createTime: Date;

  @JSONSchema({ description: 'Team update time' })
  @IsDate()
  @IsOptional()
  updateTime: Date;

  @JSONSchema({ description: 'Team deletion status' })
  @IsBoolean()
  @IsOptional()
  deleted: Boolean;
}

export class TeamBaseDetailRes extends ResponseBase {
  @JSONSchema({ description: 'Team details' })
  @ValidateNested({ each: true })
  data: TeamBaseDetail;
}

export class UpdateTeamDetailReq {
  @JSONSchema({ description: 'Team ID' })
  @IsString()
  @Length(20, 20)
  teamId: string;

  @JSONSchema({ description: 'Team name' })
  @IsString()
  @Length(1, 100)
  name: string;
}

export class TeamStatusReq {
  @JSONSchema({ description: 'Team ID' })
  @IsString()
  @Length(20, 20)
  teamId: string;

  @JSONSchema({ description: 'Team deletion status' })
  @IsBoolean()
  @IsOptional()
  status: boolean;
}

export class TeamListRes extends ResponsePageBase {
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  data: TeamDetail;
}

export class TeamMemberDetailReq {
  @JSONSchema({ description: 'Team ID' })
  @IsString()
  @Length(20, 20)
  teamId: string;

  @JSONSchema({ description: 'team member' })
  @ValidateNested({ each: true })
  @IsArray()
  @ArrayMinSize(1)
  members: MemberBase[];
}

export class AddDeleteTeamMembers {
  @JSONSchema({ description: 'Team ID' })
  @IsString()
  @Length(20, 20)
  teamId: string;

  @JSONSchema({ description: 'Team member ID' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  userIds: string[];
}

export class GetTeamMemberListReq {
  @JSONSchema({ description: 'Team ID' })
  @IsString()
  @Length(20, 20)
  teamId: string;

  @JSONSchema({ description: 'Member account name' })
  @IsString()
  @IsOptional()
  search: string;

  @JSONSchema({ description: 'Current page number' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page: number;

  @JSONSchema({ description: 'Number of data per page' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  size: number;
}
