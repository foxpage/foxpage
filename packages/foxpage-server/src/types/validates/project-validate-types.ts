import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

import { FolderDetail, FolderDetailRes } from './file-validate-types';
import { ResponseBase, ResponsePageBase } from './index-validate-types';

export class AddProjectDetailReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Project name' })
  @IsString()
  @Length(0, 100)
  name: string;

  @JSONSchema({ description: 'Organization ID' })
  @IsString()
  @IsOptional()
  @Length(20, 20)
  organizationId: string;

  @JSONSchema({ description: 'Project Introduction' })
  @IsString()
  @IsOptional()
  intro: string;

  @JSONSchema({ description: 'Project path' })
  @IsString()
  @IsOptional()
  path: string;
}

export class ProjectPageContent {
  @JSONSchema({ description: 'page locale' })
  @IsString()
  locale: string;

  @JSONSchema({ description: 'page details' })
  @IsString()
  detail: string;
}

export class ProjectPage {
  @JSONSchema({ description: 'page name' })
  @IsString()
  name: string;

  @JSONSchema({ description: 'Page path, xx/xx/xx' })
  @IsString()
  @IsOptional()
  path: string;

  @JSONSchema({ description: 'page content' })
  @ValidateNested()
  @IsObject()
  @Type(() => ProjectPageContent)
  content: ProjectPageContent;
}

export class AddProjectPagesReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Project ID' })
  @IsString()
  @Length(20, 20)
  projectId: string;

  @JSONSchema({ description: 'Page data' })
  @ValidateNested({ each: true })
  @Type(() => ProjectPage)
  files: Array<ProjectPage>;
}

export class UpdateProjectDetailReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Project ID' })
  @IsString()
  @Length(20, 20)
  projectId: string;

  @JSONSchema({ description: 'Project name' })
  @IsString()
  @IsOptional()
  @Length(0, 100)
  name: string;

  @JSONSchema({ description: 'Project Introduction' })
  @IsString()
  @IsOptional()
  intro: string;

  @JSONSchema({ description: 'Project path' })
  @IsString()
  @IsOptional()
  path: string;
}

export class ProjectDetailRes extends FolderDetailRes {}

export class ProjectListReq {
  @JSONSchema({ description: 'Organization ID' })
  @IsString()
  @IsOptional()
  @Length(20, 20)
  organizationId: string;

  @JSONSchema({ description: 'Project type, user, involve, team, organization, default is organization' })
  @IsString()
  @IsOptional()
  type: string;

  @JSONSchema({ description: 'Target type project, if type is team, then typeId is team id' })
  @IsString()
  @IsOptional()
  typeId: string;

  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  @IsOptional()
  applicationId: string;

  @JSONSchema({ description: 'Filter fields, search project or file info, project|file' })
  @IsString()
  @IsOptional()
  searchType: string;

  @JSONSchema({ description: 'Filter fields, organization name, project name or id, file name or id' })
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

export class ProjectPageFilter {
  @JSONSchema({ description: 'Path' })
  @ValidateNested({ each: true })
  @Type(() => String)
  pathList: Array<String>;
}

export class ProjectPagesReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Project ID' })
  @IsString()
  @Length(20, 20)
  projectId: string;

  @JSONSchema({ description: 'filter conditions' })
  @ValidateNested()
  @IsObject()
  filter: ProjectPageFilter;
}

export class ProjectListRes extends ResponsePageBase {
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => FolderDetail)
  data: Array<FolderDetail>;
}

export class ProjectPageDetail {
  @JSONSchema({ description: 'File ID' })
  @IsString()
  @Length(20, 20)
  fileId: string;

  @JSONSchema({ description: 'File path' })
  @IsString()
  path: string;

  @JSONSchema({ description: 'File version' })
  @IsString()
  version: string;

  @JSONSchema({ description: 'File version content' })
  @IsObject()
  content: object;
}

export class ProjectScopeTypeReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Project ID', default: 'Project ID/Folder ID' })
  @IsString()
  @IsOptional()
  id: string;

  @JSONSchema({ description: 'Search field, name' })
  @IsString()
  @IsOptional()
  search: string;

  @JSONSchema({ description: 'Search field, multiple names match exactly' })
  @IsArray()
  @IsOptional()
  names: Array<string>;

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

export class ProjectPageListRes extends ResponseBase {
  @ValidateNested({ each: true })
  @IsObject()
  @Type(() => ProjectPageDetail)
  data: ProjectPageDetail;
}

export class PublishProjectPageReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Project ID' })
  @IsString()
  @Length(20, 20)
  projectId: string;

  @JSONSchema({ description: 'Page content ID list' })
  @IsArray()
  ids: Array<string>;
}

export class PublishProjectPageRes extends ResponseBase {
  @ValidateNested({ each: true })
  @IsObject()
  @Type(() => ProjectPageDetail)
  data: ProjectPageDetail;
}

export class ProjectDeleteReq {
  @JSONSchema({ description: 'Project ID' })
  @IsString()
  projectId: string;

  @JSONSchema({ description: 'Application ID to which the project belongs' })
  @IsString()
  @Length(20, 20)
  applicationId: string;
}

export class WorkspaceProjectListReq {
  @JSONSchema({ description: 'Organization id' })
  @IsString()
  @Length(20, 20)
  organizationId: string;

  @JSONSchema({ description: 'Filter fields, currently only filter by organization name' })
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

export class AddProjectRelationsReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Target content ID' })
  @IsString()
  contentId: string;

  @JSONSchema({ description: 'Relation and schema in DSL' })
  @IsObject()
  relationSchemas: any;
}

export class AddProjectRelationsRes {}
