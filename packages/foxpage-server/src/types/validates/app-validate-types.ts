import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

import { FolderDetail } from './file-validate-types';
import { PagingReq, ResponseBase, ResponsePageBase } from './index-validate-types';
import { UserBase } from './user-validate-types';

export class AppIDReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;
}

export class AppDetail {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @JSONSchema({ description: 'Application name' })
  @IsString()
  @Length(1, 50)
  name: string;

  @JSONSchema({ description: 'Application introduction' })
  @IsString()
  intro?: string;

  @JSONSchema({ description: 'Application Owner' })
  @IsString()
  @Length(20)
  creator: string;

  @JSONSchema({ description: 'Application locales' })
  @IsArray()
  locales: Array<string>;

  @JSONSchema({ description: 'Application resources' })
  @ValidateNested()
  @Type(() => AppResource)
  resources: Array<AppResource>;

  @JSONSchema({ description: 'Application create time' })
  @IsDate()
  @IsOptional()
  createTime: Date;

  @JSONSchema({ description: 'Application update time' })
  @IsDate()
  @IsOptional()
  updateTime: Date;

  @JSONSchema({ description: 'deleted status' })
  @IsBoolean()
  @IsOptional()
  deleted: Boolean;
}

export class AppResource {
  @JSONSchema({ description: 'Resource Name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  name: string;

  @JSONSchema({ description: 'resource type, 1: self-built, 2: third party' })
  @IsNumber()
  type: number;

  @JSONSchema({ description: 'Resource basic information' })
  @IsObject()
  @IsOptional()
  detail: any;

  @JSONSchema({ description: 'Resource id' })
  @IsString()
  @IsOptional()
  id: string;
}

export class AppHostInfo {
  @JSONSchema({ description: 'Host url' })
  @IsString()
  url: string;

  @JSONSchema({ description: 'Host locales' })
  @IsArray()
  locales: Array<string>;
}

export class AppBaseDetail {
  @JSONSchema({ description: 'Application Name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  name: string;

  @JSONSchema({ description: 'Application introdution' })
  @IsString()
  @IsOptional()
  intro: string;

  @JSONSchema({ description: 'Application Host' })
  @IsArray()
  @IsOptional()
  host: AppHostInfo[];

  @JSONSchema({ description: 'App Slug' })
  @IsString()
  @IsOptional()
  slug: string;

  @JSONSchema({ description: 'application locales' })
  @IsArray()
  @IsOptional()
  locales: Array<string>;

  @JSONSchema({ description: 'Application static resources' })
  @ValidateNested()
  @IsOptional()
  @Type(() => AppResource)
  resources: Array<AppResource>;
}

export class AppListReq extends PagingReq {
  @JSONSchema({ description: 'Organization ID' })
  @IsString()
  @Length(20, 20)
  organizationId: string;

  @JSONSchema({
    description: 'App type, user|organization|project|user_project|involve_project, default is organization',
  })
  @IsString()
  @IsOptional()
  type: string;

  @JSONSchema({ description: 'Filter fields, currently only filtered by application name' })
  @IsString()
  @IsOptional()
  search?: string;
}

export class AllAppListReq extends PagingReq {
  @JSONSchema({ description: 'Filter fields, currently only filtered by application name' })
  @IsString()
  @IsOptional()
  search?: string;
}

export class AppListByIdsReq {
  @JSONSchema({ description: 'Application ID list' })
  @IsArray()
  applicationIds: Array<string>;
}

export class AddAppDetailReq extends AppBaseDetail {
  @JSONSchema({ description: 'Organization ID to which the application belongs' })
  @IsString()
  @IsNotEmpty()
  @Length(20, 20)
  organizationId: string;
}

export class UpdateAppReq extends AppBaseDetail {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;
}

export class AppListRes extends ResponsePageBase {
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  data: AppDetail;
}

export class AppDetailRes extends ResponseBase {
  @JSONSchema({ description: 'Application details' })
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  data: AppDetail;
}

export class AppResourceDetailRes extends ResponseBase {
  @JSONSchema({ description: 'Application resource details' })
  @ValidateNested({ each: true })
  @IsArray()
  data: AppResource;
}

export class AppInfo {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @IsNotEmpty()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'Application Name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  name: string;
}

export class AppDetailReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Resource Type' })
  @IsString()
  @IsOptional()
  type: string;
}

export class AppDetailWithFolder extends AppDetail {
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  folders: FolderDetail;
}

export class AppDetailWithFolderRes extends ResponseBase {
  @ValidateNested({ each: true })
  data: AppDetailWithFolder;
}

export class AppPackageListReq extends AppIDReq {}

export class AppPackageListDetail {
  @JSONSchema({ description: 'Content ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Component name' })
  @IsString()
  title: string;

  @JSONSchema({ description: 'Component live version' })
  @IsString()
  version: string;

  @JSONSchema({ description: 'Component details' })
  @IsObject()
  content: any;
}

export class AppPackageListRes extends ResponseBase {
  @JSONSchema({ description: 'Application component list' })
  @ValidateNested({ each: true })
  @IsArray()
  data: AppPackageListDetail;
}

export class AppLocalesReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;
}

export class AppLocalesRes extends ResponseBase {
  @JSONSchema({ description: 'Application Locales' })
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => String)
  data: Array<string>;
}

export class AppProjectGoodsListReq extends PagingReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Filter filed, goods types' })
  @IsString()
  type: string;

  @JSONSchema({ description: 'Product name, fuzzy match' })
  @IsString()
  @IsOptional()
  search: string;
}

export class AppPackageGoodsListReq extends PagingReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Product name, fuzzy match' })
  @IsString()
  @IsOptional()
  search: string;
}

export class AppSettingListReq extends PagingReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'App type, user, organization, default is organization' })
  @IsString()
  type: string;

  @JSONSchema({ description: 'Filter fields, currently only filtered by application name' })
  @IsString()
  @IsOptional()
  search?: string;
}

export class AppSettingInfo {
  @JSONSchema({ description: 'App setting item idx' })
  @IsNumber()
  @IsOptional()
  idx: number;

  @JSONSchema({ description: 'App setting item id, file Id' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'App setting item name' })
  @IsString()
  name: string;

  @JSONSchema({ description: 'Item type status, true|false' })
  @IsBoolean()
  status: boolean;

  @JSONSchema({ description: 'Item type category' })
  @ValidateNested({ each: true })
  @IsObject()
  @IsOptional()
  category: Record<string, any>;

  @JSONSchema({ description: 'Item type default value' })
  @ValidateNested({ each: true })
  @IsObject()
  @IsOptional()
  defaultValue: Record<string, any>;
}

export class AppSettingDetailReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Application setting item type, page|template|block|component' })
  @IsString()
  type: string;

  @JSONSchema({ description: 'Application setting item detail' })
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => AppSettingInfo)
  setting: AppSettingInfo[];
}

export class AppSettingItemDetail extends AppSettingInfo {
  @JSONSchema({ description: 'Application Owner' })
  @IsObject()
  creator: UserBase;

  @JSONSchema({ description: 'Application create time' })
  @IsDate()
  createTime: Date;

  @JSONSchema({ description: 'Application update time' })
  @IsDate()
  updateTime: Date;
}

export class AppSettingItemRes extends ResponsePageBase {
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => AppSettingItemDetail)
  data: Array<AppSettingItemDetail>;
}

export class RemoveAppSettingDetailReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Application setting item type, page|template|component' })
  @IsString()
  type: string;

  @JSONSchema({ description: 'Application setting item type idx list, split by ","' })
  @IsString()
  ids: string;
}
