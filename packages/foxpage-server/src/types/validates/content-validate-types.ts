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

import { App, CreatorInfo, PagingReq, ResponseBase } from './index-validate-types';
import { UserBase } from './user-validate-types';

export class AppContentId {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Page Content ID' })
  @IsString()
  id: string;
}

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

  @JSONSchema({ description: 'Page Content base tag' })
  @IsBoolean()
  @IsOptional()
  isBase: boolean;

  @JSONSchema({ description: 'Page Content extend tag' })
  @IsString()
  @Length(20, 20)
  @IsOptional()
  extendId: string;

  @JSONSchema({ description: 'Page label' })
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  tags: any[];

  @JSONSchema({ description: 'Set one locale per file, default is false' })
  @IsBoolean()
  @IsOptional()
  oneLocale: boolean;

  @JSONSchema({ description: 'Content dsl' })
  @IsObject()
  @IsOptional()
  content: Record<string, string>;
}

export class UpdateContentReq extends AppContentId {
  @JSONSchema({ description: 'Page Title' })
  @IsString()
  @IsOptional()
  title: string;

  @JSONSchema({ description: 'Page Content base tag' })
  @IsBoolean()
  @IsOptional()
  isBase: boolean;

  @JSONSchema({ description: 'Page Content extend tag' })
  @IsString()
  @IsOptional()
  extendId: string;

  @JSONSchema({ description: 'Depended page content ID' })
  @IsString()
  @IsOptional()
  pageContentId: string;

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

  @JSONSchema({ description: 'Version extension' })
  @IsObject()
  @IsOptional()
  extension: Record<string, any>;
}

export class ContentVersionUpdateReq extends AppContentId {
  @JSONSchema({ description: 'Page version content' })
  @IsObject()
  @ValidateNested()
  content: ContentSchemaRelation;

  @JSONSchema({ description: 'Page version number' })
  @IsString()
  @IsOptional()
  version: string;

  @JSONSchema({ description: 'Page content id' })
  @IsString()
  @IsOptional()
  pageContentId: string;

  @JSONSchema({ description: 'Page last update time' })
  @IsString()
  @IsOptional()
  contentUpdateTime: string;
}

export class ContentVersionBaseUpdateReq extends AppContentId {
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
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Page ID' })
  @IsString()
  contentId: string;

  @JSONSchema({ description: 'Live version number' })
  @IsNumber()
  @IsOptional()
  versionNumber: number;

  @JSONSchema({ description: 'Live version id' })
  @IsString()
  @IsOptional()
  versionId: string;
}

export class ContentVersionListReq extends AppContentId {
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

  @JSONSchema({ description: 'Path, path or file id must pass one of it' })
  @IsString()
  @IsOptional()
  pathname: string;

  @JSONSchema({ description: 'File id, path or file id must pass one of it' })
  @IsString()
  @IsOptional()
  fileId: string;

  @JSONSchema({ description: 'Content Tags' })
  @IsArray()
  @ValidateNested()
  @IsOptional()
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

export class AppContentStatusReq extends AppContentId {
  @JSONSchema({ description: 'Delete status' })
  @IsBoolean()
  @IsOptional()
  status: boolean;
}

export class AppContentLiveReq extends AppContentId {
  @JSONSchema({ description: 'live version number' })
  @IsNumber()
  versionNumber: number;
}

export class AppContentOfflineReq extends AppContentId {}

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

  @JSONSchema({ description: 'Version status, canary | release' })
  @IsString()
  status: ContentStatus;
}

export class VersionPublishStatus2Req extends VersionPublishStatusReq {
  @JSONSchema({ description: 'Content ID, contentId or versionId must provider one of it' })
  @IsString()
  @Length(20, 20)
  @IsOptional()
  contentId: string;

  @JSONSchema({ description: 'Version ID' })
  @IsString()
  @Length(20, 20)
  @IsOptional()
  id: string;
}

export class CloneContentReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Content ID' })
  @IsString()
  sourceContentId: string;

  @JSONSchema({ description: 'Target Content ID' })
  @IsString()
  @IsOptional()
  targetContentId: string;

  @JSONSchema({ description: 'Target content locales' })
  @IsArray()
  @IsOptional()
  targetContentLocales: any[];

  @JSONSchema({ description: 'Version Number' })
  @IsNumber()
  @IsOptional()
  sourceVersionNumber: number;

  @JSONSchema({ description: 'Copy content include base content, default is false' })
  @IsBoolean()
  @IsOptional()
  includeBase: boolean;
}

export class SaveToBaseReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Content ID' })
  @IsString()
  contentId: string;
}

export class SetVersionTemplateReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Content Version ID' })
  @IsString()
  versionId: string;

  @JSONSchema({ description: 'Template ID' })
  @IsString()
  templateId: string;
}

export class ContentLogItem {
  @JSONSchema({ description: 'Content item id' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Content item data type, variable, condition, structure..' })
  @IsString()
  type: string;

  @JSONSchema({ description: 'Content log data' })
  content: any;
}

export class ContentLogStructureItem {
  @JSONSchema({ description: 'Content log data' })
  @IsArray()
  @ValidateNested({ each: true })
  content: ContentLogItem[];

  @JSONSchema({ description: 'Content data action type, create|update|remove' })
  @IsString()
  action: string;

  @JSONSchema({ description: 'Version structure ID' })
  @IsString()
  @IsOptional()
  structureId: string;

  @JSONSchema({ description: 'Content data change time' })
  @IsNumber()
  @IsOptional()
  createTime: number;
}

export class AddContentLogsReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Content ID' })
  @IsString()
  contentId: string;

  @JSONSchema({ description: 'Content Version ID' })
  @IsString()
  @IsOptional()
  versionId: string;

  @JSONSchema({ description: 'Content Logs' })
  @IsArray()
  @ValidateNested({ each: true })
  logs: ContentLogStructureItem[];
}

export class GetContentLogsReq extends PagingReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Content ID' })
  @IsString()
  contentId: string;

  @JSONSchema({ description: 'Content Version ID' })
  @IsString()
  @IsOptional()
  versionId: string;

  @JSONSchema({ description: 'Content Structure ID' })
  @IsString()
  @IsOptional()
  structureId: string;
}

export class GetContentStructureLogsReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Content ID' })
  @IsString()
  contentId: string;

  @JSONSchema({ description: 'Content Version ID' })
  @IsString()
  @IsOptional()
  versionId: string;
}

export class CheckVersionPublishReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Content ID' })
  @IsString()
  contentId: string;

  @JSONSchema({ description: 'Content Version ID' })
  @IsString()
  @IsOptional()
  versionId: string;
}

export class LockBuildContentReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Content ID' })
  @IsString()
  contentId: string;

  @JSONSchema({ description: 'Content Version ID' })
  @IsString()
  versionId: string;
}

export class LockBuildContentResDetail {
  @JSONSchema({ description: 'Lock status' })
  @IsBoolean()
  status: boolean;

  @JSONSchema({ description: 'Last operation time' })
  @IsNumber()
  operationTime: number;

  @JSONSchema({ description: 'Current Lock user info' })
  @ValidateNested({ each: true })
  @IsObject()
  operator: UserBase;
}

export class LockBuildContentRes extends ResponseBase {
  @ValidateNested({ each: true })
  data: LockBuildContentResDetail;
}

export class getContentSyncInfoRes extends ResponseBase {
  @ValidateNested({ each: true })
  data: any;
}

export class UpdateVersionBySyncReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Content ID' })
  @IsString()
  contentId: string;

  @JSONSchema({ description: 'Sync source info' })
  @IsObject()
  syncSource: Record<string, any>;

  @JSONSchema({ description: 'Content infos' })
  @IsObject()
  contentInfo: any;
}

export class SetContentTagsReq extends AppContentId {
  @JSONSchema({ description: 'Content tags' })
  @IsArray()
  tags: Record<string, any>[];
}

export class EncryptContentsReq {
  @JSONSchema({ description: 'The data need to encrypt' })
  @IsObject()
  data: Record<string, string>;

  @JSONSchema({ description: 'Expire time, timestamps second, default 7 days' })
  @IsNumber()
  @IsOptional()
  expireTime: number;

  @JSONSchema({ description: 'The token to validate' })
  @IsString()
  @IsOptional()
  token: string;
}
