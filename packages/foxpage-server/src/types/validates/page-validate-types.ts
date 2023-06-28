import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
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

import { UserBase } from '../user-types';

import { ComponentDetail } from './component-validate-types';
import { ContentBaseDetail, ContentVersionBaseDetail } from './content-validate-types';
import { FileBaseDetail } from './file-validate-types';
import { PagingReq, ResponseBase, ResponsePageBase } from './index-validate-types';

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

export class AppPageBuilderItemReq extends PagingReq {
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

  @JSONSchema({ description: 'Builder filter, name or file id' })
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
  applicationId: string;

  @JSONSchema({ description: 'Content ID' })
  @IsString()
  id: string;
}

export class PageVersionReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Content ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Content Version ID' })
  @IsString()
  @IsOptional()
  versionId: string;
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

export class BlockLocaleLiveVersionReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'File ID' })
  @IsArray()
  ids: string[];

  @JSONSchema({ description: 'Content locale' })
  @IsString()
  locale: string;
}

export class BlockLocaleLiveVersionRes extends ResponseBase {
  @ValidateNested({ each: true })
  @IsObject()
  data: object;
}

export class GetProjectItemsReq extends PagingReq {
  @JSONSchema({ description: 'Organization ID' })
  @IsString()
  organizationId: string;

  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @IsOptional()
  applicationId: string;

  @JSONSchema({ description: 'Search string' })
  @IsString()
  @IsOptional()
  search: string;
}

export class PageTypeSearchReq extends GetProjectItemsReq {
  @JSONSchema({
    description:
      'Data type, project|page_template|page|template|variable|condition|function|project_variable|project_condition|project_function|component|content',
  })
  @IsString()
  type: string;

  @JSONSchema({ description: 'Data type id' })
  @IsString()
  @IsOptional()
  typeId: string;

  @JSONSchema({ description: 'data assoc user type, team|user|involve' })
  @IsString()
  @IsOptional()
  userType: string;
}

export class GetTypeItemVersionReq extends PagingReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Page Content ID' })
  @IsString()
  contentId: string;
}

export class TypeItemVersionsItem {
  @JSONSchema({ description: 'Version ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Content ID' })
  @IsString()
  contentId: string;

  @JSONSchema({ description: 'Version' })
  @IsString()
  version: string;

  @JSONSchema({ description: 'Version Number' })
  @IsNumber()
  versionNumber: number;

  @JSONSchema({ description: 'Version Status' })
  @IsString()
  status: string;

  @JSONSchema({ description: 'Version live status' })
  @IsBoolean()
  isLive: boolean;

  @JSONSchema({ description: 'Page Creator' })
  @ValidateNested({ each: true })
  @IsObject()
  creator: UserBase;

  @JSONSchema({ description: 'Page Publish user' })
  @ValidateNested({ each: true })
  @IsObject()
  publisher: UserBase;

  @JSONSchema({ description: 'Version Create Time' })
  @IsString()
  createTime: Date;

  @JSONSchema({ description: 'Version Update Time' })
  @IsString()
  updateTime: Date;

  @JSONSchema({ description: 'Version Publish Time' })
  @IsString()
  publishTime: Date;
}

export class TypeItemVersionsRes extends ResponseBase {
  @ValidateNested({ each: true })
  @IsArray()
  data: TypeItemVersionsItem;
}

export class GetContentVersionLogs {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Page Content ID' })
  @IsString()
  contentId: string;

  @JSONSchema({ description: 'Page Version ID' })
  @IsString()
  versionId: string;
}

export class ContentVersionLogItem {
  @JSONSchema({ description: 'Version ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Content ID' })
  @IsString()
  contentId: string;

  @JSONSchema({ description: 'Version' })
  @IsString()
  version: string;

  @JSONSchema({ description: 'Version Number' })
  @IsNumber()
  versionNumber: number;

  @JSONSchema({ description: 'Log Action' })
  @IsString()
  action: string;

  @JSONSchema({ description: 'Version live status' })
  @IsArray()
  content: any[];

  @JSONSchema({ description: 'Page Content ID' })
  @ValidateNested({ each: true })
  @IsObject()
  creator: UserBase;

  @JSONSchema({ description: 'Version Create Time' })
  @IsString()
  createTime: Date;

  @JSONSchema({ description: 'Version Update Time' })
  @IsString()
  updateTime: Date;
}

export class ContentVersionLogRes extends ResponseBase {
  @ValidateNested({ each: true })
  @IsArray()
  data: ContentVersionLogItem;
}
