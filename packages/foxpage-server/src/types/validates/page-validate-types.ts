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
import { ContentBaseDetail, ContentVersionBaseDetail } from './content-validate-types';
import { FileBaseDetail } from './file-validate-types';
import { PagingReq, ResponsePageBase } from './index-validate-types';

;

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

  @JSONSchema({ description: 'Response data type: live|"", default is empty to get all status data' })
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

export class AppPageBuilderItemReq extends PagingReq{
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'page build scope, application|user|involve' })
  @IsString()
  scope: string;

  @JSONSchema({ description: 'Builder type, page|template' })
  @IsString()
  type: string;

  @JSONSchema({ description: 'Builder filter, name of file id' })
  @IsString()
  @IsOptional()
  search: string;
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
  applicationId: string;

  @JSONSchema({ description: 'Group scope, application|project' })
  @IsString()
  @IsOptional()
  scope: string;

  @JSONSchema({ description: 'Get the file under project when scope typs is project, eg. project id' })
  @IsString()
  @IsOptional()
  folderId: string;

  @JSONSchema({ description: 'File name or file id' })
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

export class AppPageItemListContentReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Project ID' })
  @IsString()
  @IsOptional()
  projectId: string;

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

  @JSONSchema({ description: 'Search, item name or id' })
  @IsString()
  @IsOptional()
  search: string;
}

export class AppProjectItemContentDetail extends FileBaseDetail {
  @ValidateNested()
  @IsArray()
  contents: ContentBaseDetail[];
}
export class AppProjectItemContentDetailRes extends ResponsePageBase {
  @ValidateNested()
  @IsArray()
  data: AppProjectItemContentDetail[];
}