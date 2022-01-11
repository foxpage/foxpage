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
  Min,
  ValidateNested,
} from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

import { FolderDetail } from './file-validate-types';
import { ResponseBase, ResponsePageBase } from './index-validate-types';

export class AppDetail {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @JSONSchema({ description: 'Application name' })
  @IsString()
  @Length(5, 50)
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
  id: string;
}

export class AppBaseDetail {
  @JSONSchema({ description: 'Application Name' })
  @IsString()
  @IsNotEmpty()
  @Length(5, 50)
  name: string;

  @JSONSchema({ description: 'Application introdution' })
  @IsString()
  @IsOptional()
  intro: string;

  @JSONSchema({ description: 'Application Host' })
  @IsArray()
  @IsOptional()
  host: Array<string>;

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

export class AppListReq {
  @JSONSchema({ description: 'Organization ID' })
  @IsString()
  @Length(20, 20)
  organizationId: string;

  @JSONSchema({ description: 'Filter fields, currently only filtered by application name' })
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

export class AllAppListReq {
  @JSONSchema({ description: 'Filter fields, currently only filtered by application name' })
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
  @Length(5, 50)
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

export class AppPackageListReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;
}

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

export class AppProjectGoodsListReq {
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

export class AppPackageGoodsListReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Product name, fuzzy match' })
  @IsString()
  @IsOptional()
  search: string;

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
