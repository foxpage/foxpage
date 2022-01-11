import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Min,
  // IsDate,
  // IsBoolean,
  ValidateNested,
} from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

import { ComponentDetail } from './component-validate-types';
import { ContentVersionBaseDetail } from './content-validate-types';
import { PagingReq, ResponsePageBase } from './index-validate-types';

export class AppPageListCommonReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'File ID' })
  @IsString()
  @Length(20, 20)
  fileId: string;

  @JSONSchema({ description: 'Current page number' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page: number;

  @JSONSchema({ description: 'Number of data per page' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  size: number;

  @JSONSchema({ description: 'Search characters, content name and ID' })
  @IsString()
  @IsOptional()
  search: string;
}

export class AppTypePageListCommonReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Folder ID' })
  @IsString()
  @Length(20, 20)
  @IsOptional()
  folderId: string;

  @JSONSchema({ description: 'Response data type: project|app|all, default is app' })
  @IsString()
  @IsOptional()
  type: string;

  @JSONSchema({ description: 'Current page number' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page: number;

  @JSONSchema({ description: 'Number of data per page' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  size: number;

  @JSONSchema({ description: 'Search characters, content name and ID' })
  @IsString()
  @IsOptional()
  search: string;
}

export class AppPageCatalogCommonReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'File ID' })
  @IsString()
  @Length(20, 20)
  id: string;
}

export class AppContentVersionReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Content ID list' })
  @IsArray()
  ids: Array<string>;
}

export class AppTypeFilesReq extends PagingReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  // @JSONSchema({ description:'' })
  // @IsString()
  // type: string;

  @JSONSchema({ description: 'File name' })
  @IsString()
  @IsOptional()
  search: string;
}

export class PageBuildVersionReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Content ID' })
  @IsString()
  @Length(20, 20)
  id: string;
}

export class AppContentDetail {
  @JSONSchema({ description: 'Version ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Version content ID' })
  @IsString()
  contentId: string;

  @JSONSchema({ description: 'Version' })
  @IsString()
  version: string;

  @JSONSchema({ description: 'Version number' })
  @IsNumber()
  versionNumber: number;

  @JSONSchema({ description: 'Version details' })
  @IsObject()
  content: any;
}

export class AppContentListRes extends ResponsePageBase {
  @ValidateNested({ each: true })
  @IsArray()
  list: AppContentDetail;
}

export class PageContentData {
  @JSONSchema({ description: 'Content ID' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'Content details' })
  @IsString()
  @Length(20, 20)
  schemas: any[];

  @JSONSchema({ description: 'Content reference list' })
  @IsString()
  @Length(20, 20)
  relation: object;
}

export class PageContentDataRes extends ResponsePageBase {
  @ValidateNested({ each: true })
  @IsArray()
  data: PageContentData;
}

export class PageBuildVersion extends ContentVersionBaseDetail {
  @JSONSchema({ description: 'Component details' })
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => ComponentDetail)
  components: Array<ComponentDetail>;
}

export class PageBuildVersionRes {
  @ValidateNested()
  @IsObject()
  data: PageBuildVersion;
}
