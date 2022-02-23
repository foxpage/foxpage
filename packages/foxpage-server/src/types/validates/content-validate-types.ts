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

import { ContentStatus } from '@foxpage/foxpage-server-types';

import { App, CreatorInfo, ResponseBase } from './index-validate-types';

export class AddContentReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'File ID to which the page belongs' })
  @IsString()
  @Length(20, 20)
  fileId: string;

  @JSONSchema({ description: 'Page Title' })
  @IsString()
  @Length(1, 100)
  title: string;

  @JSONSchema({ description: 'Page label' })
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  tags: any[];
}

export class UpdateContentReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'page content ID' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'Page Title' })
  @IsString()
  @IsOptional()
  title: string;

  @JSONSchema({ description: 'Page label' })
  @ValidateNested({ each: true })
  @IsArray()
  // @Type(() => ContentTag)
  @IsOptional()
  tags: Array<any>;
}

export class ContentBaseDetail {
  @JSONSchema({ description: 'Page ID' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'Page Title' })
  @IsString()
  title: string;

  @JSONSchema({ description: 'File ID to which the page belongs' })
  @IsString()
  @Length(20, 20)
  fileId: string;

  @JSONSchema({ description: 'Page label' })
  @ValidateNested()
  @IsArray()
  @IsOptional()
  tags: Record<string, string>;

  @JSONSchema({ description: 'page live version ID' })
  @IsNumber()
  liveVersionCode: number;

  @JSONSchema({ description: 'Page creator' })
  @IsString()
  @Length(20, 20)
  creator: string;

  @JSONSchema({ description: 'page creation time' })
  @IsDate()
  @IsOptional()
  createTime: Date;

  @JSONSchema({ description: 'page update time' })
  @IsDate()
  @IsOptional()
  updateTime: Date;

  @JSONSchema({ description: 'Page delete status' })
  @IsBoolean()
  @IsOptional()
  deleted: Boolean;
}

export class ContentDetail {
  @JSONSchema({ description: 'Page ID' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'Page Title' })
  @IsString()
  title: string;

  @JSONSchema({ description: 'File ID to which the page belongs' })
  @IsString()
  @Length(20, 20)
  fileId: string;

  @JSONSchema({ description: 'Page label' })
  @ValidateNested()
  @IsArray()
  @IsOptional()
  tags: any;

  @JSONSchema({ description: 'page live version ID' })
  @IsNumber()
  liveVersionNumber: number;

  @JSONSchema({ description: 'Page live version number' })
  @IsString()
  @IsOptional()
  liveVersion: string;

  @JSONSchema({ description: 'Page creator' })
  @IsObject()
  creator: CreatorInfo;

  @JSONSchema({ description: 'page creation time' })
  @IsDate()
  @IsOptional()
  createTime: Date;

  @JSONSchema({ description: 'page update time' })
  @IsDate()
  @IsOptional()
  updateTime: Date;

  @JSONSchema({ description: 'Page delete status' })
  @IsBoolean()
  @IsOptional()
  deleted: Boolean;
}

export class ContentDetailRes extends ResponseBase {
  @ValidateNested({ each: true })
  data: ContentDetail;
}

export class ContentBaseDetailRes extends ResponseBase {
  @ValidateNested({ each: true })
  data: ContentBaseDetail;
}

export class TagVersionRelation {
  @JSONSchema({ description: 'page content' })
  @ValidateNested()
  content: ContentDetail;

  @JSONSchema({ description: 'The version corresponding to the page, including the relation version' })
  @ValidateNested()
  contentInfo: any;
}

export class TagVersionRelationRes extends ResponseBase {
  @ValidateNested({ each: true })
  data: TagVersionRelation;
}

export class DeleteContentReq {
  @JSONSchema({ description: 'page content ID' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'Deleted status of page content; true: deleted, false: normal' })
  @IsBoolean()
  status: boolean;
}

export class ContentStatusReq {
  @JSONSchema({ description: 'Page version ID' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'Page version status: base|alpha|beta|release...' })
  @IsString()
  status: string;
}

export class ContentListReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'File ID to which the page belongs' })
  @IsString()
  @Length(20, 20)
  fileId: string;

  @JSONSchema({ description: 'page content deleted status, default is false' })
  @IsBoolean()
  @IsOptional()
  deleted: boolean;

  @JSONSchema({ description: 'page content search string' })
  @IsString()
  @IsOptional()
  search: string;
}

export class ContentDetailsReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Content ID list' })
  @IsArray()
  contentIds: Array<string>;
}

export class ContentVersionReq {
  @JSONSchema({ description: 'page application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'page content ID' })
  @IsString()
  @Length(20, 20)
  contentId: string;

  @JSONSchema({ description: 'Page content version number' })
  @IsString()
  version: string;

  @JSONSchema({ description: 'page content' })
  @IsObject()
  @IsOptional()
  content: any;
}

export class DSLContentStructureReq {
  @JSONSchema({ description: 'Content version ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Operation type, add|update|delete|move' })
  @IsString()
  type: string;

  @JSONSchema({ description: 'parent ID' })
  @IsString()
  @IsOptional()
  parentId: string;

  @JSONSchema({ description: 'The position of the node under the parent' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  position: number;

  @JSONSchema({ description: 'Node content' })
  @IsObject()
  content: any;

  @JSONSchema({ description: 'Node associated content' })
  @IsObject()
  @IsOptional()
  relation: Record<string, any>;
}

export class ContentSchemaRelation {
  @JSONSchema({ description: 'Page ID' })
  @IsString()
  @Length(20, 20)
  @IsOptional()
  id: string;

  @JSONSchema({ description: 'Version content' })
  @ValidateNested()
  @IsArray()
  schemas: any;

  @JSONSchema({ description: 'Content associated with version' })
  @IsObject()
  @IsOptional()
  relation: Record<string, any>;
}

export class ContentVersionUpdateReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'page content ID' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'Page version content' })
  @IsObject()
  @ValidateNested()
  content: ContentSchemaRelation;

  @JSONSchema({ description: 'Page version number' })
  @IsString()
  @IsOptional()
  version: string;
}

export class ContentVersionBaseUpdateReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'page content ID' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'Page version content' })
  @IsObject()
  @ValidateNested()
  content: ContentSchemaRelation;
}

export class ContentVersionCommonDetail {
  @JSONSchema({ description: 'Page ID' })
  @IsString()
  @Length(20, 20)
  contentId: string;

  @JSONSchema({ description: 'Page version number' })
  @IsString()
  version: string;

  @JSONSchema({ description: 'Page version number' })
  @IsString()
  versionNumber: number;

  @JSONSchema({ description: 'page state' })
  @IsString()
  status: string;

  @JSONSchema({ description: 'page content' })
  @IsObject()
  content: any;

  @JSONSchema({ description: 'page creation time' })
  @IsDate()
  @IsOptional()
  createTime: Date;

  @JSONSchema({ description: 'page update time' })
  @IsDate()
  @IsOptional()
  updateTime: Date;

  @JSONSchema({ description: 'Page delete status' })
  @IsBoolean()
  @IsOptional()
  deleted: Boolean;
}

export class ContentVersionDetail extends ContentVersionCommonDetail {
  @JSONSchema({ description: 'Page creator' })
  @ValidateNested()
  creator: CreatorInfo;
}

export class ContentVersionBaseDetail extends ContentVersionCommonDetail {
  @JSONSchema({ description: 'Page creator' })
  @IsString()
  creator: string;
}

export class ContentLiveReq {
  @JSONSchema({ description: 'Page ID' })
  @IsString()
  @Length(20, 20)
  contentId: string;

  @JSONSchema({ description: 'Live version number' })
  @IsNumber()
  versionNumber: number;
}

export class ContentVersionListReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Page ID' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'File ID to which the page belongs' })
  @IsString()
  @Length(20, 20)
  fileId: string;
}

export class ContentVersionDetailRes extends ResponseBase {
  @ValidateNested({ each: true })
  @IsArray()
  data: ContentVersionDetail;
}

export class ContentVersionBaseDetailRes extends ResponseBase {
  @ValidateNested({ each: true })
  @IsArray()
  data: ContentVersionBaseDetail;
}

export class ContentVersionBuildDetailReq extends App {
  @JSONSchema({ description: 'File ID' })
  @IsString()
  @Length(20, 20)
  fileId: string;
}

export class ContentDSLReq {
  @JSONSchema({ description: 'page content ID' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'Page content version number' })
  @IsNumber()
  @IsOptional()
  versionNumber: number;
}

export class ContentDetailReq {
  @JSONSchema({ description: 'Page ID' })
  @IsString()
  @Length(20, 20)
  id: string;
}

export class PageContentVersionDetailReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'page content ID' })
  @IsString()
  @Length(20, 20)
  contentId: string;

  @JSONSchema({ description: 'Page content version number' })
  @IsNumber()
  @IsOptional()
  versionNumber: number;
}

export class ContentVersionDetailReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'page content ID' })
  @IsString()
  @Length(20, 20)
  contentId: string;

  @JSONSchema({ description: 'Page content version number' })
  @IsNumber()
  @IsOptional()
  versionNumber: number;

  @JSONSchema({ description: 'Page content version ID' })
  @Length(20, 20)
  @IsOptional()
  id: string;
}

export class TemplateListReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Current page number' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page: number;

  @JSONSchema({ description: 'The maximum amount of data on the current page' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  size: number;
}

export class TagContentVersionReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Path' })
  @IsString()
  pathname: string;

  @JSONSchema({ description: 'Content Tags' })
  @IsArray()
  @ValidateNested()
  tags: Record<string, any>[];
}

export class AppFileContentStatusReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'ID, folder ID, file ID' })
  @IsArray()
  ids: string[];

  @JSONSchema({ description: 'Delete status' })
  @IsBoolean()
  @IsOptional()
  status: boolean;
}

export class AppContentStatusReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'ID' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'Delete status' })
  @IsBoolean()
  @IsOptional()
  status: boolean;
}

export class AppContentLiveReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Content ID' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'live version number' })
  @IsNumber()
  versionNumber: number;
}

export class ContentChangeReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Timestamp' })
  @IsNumber()
  timestamp: number;
}

export class VersionPublishStatusReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Version ID' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'Version status' })
  @IsString()
  status: ContentStatus;
}

export class CloneContentReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Target Content ID' })
  @IsString()
  targetContentId: string;

  @JSONSchema({ description: 'Content ID' })
  @IsString()
  sourceContentId: string;

  // @JSONSchema({ description: 'Version Number' })
  // @IsNumber()
  // @IsOptional()
  // sourceVersionNumber: number;
}
