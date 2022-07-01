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
  ValidateNested,
} from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

import { FolderDetailRes } from './file-validate-types';

export class AddResourceFolderDetailReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Resource name' })
  @IsString()
  @IsOptional()
  name: string;

  @JSONSchema({ description: 'Resource parent folder ID' })
  @IsString()
  @IsOptional()
  folderId: string;

  @JSONSchema({ description: 'Resource introduction' })
  @IsString()
  @IsOptional()
  intro: string;
}

export class UpdateResourceDetailReq {
  @JSONSchema({ description: 'Resource ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Resource ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Resource name' })
  @IsString()
  @IsOptional()
  name: string;

  @JSONSchema({ description: 'Resource parent folder ID' })
  @IsString()
  @IsOptional()
  folderId: string;
}

export class ResourceFolderDetailRes extends FolderDetailRes { }

export class ResourceGroupListReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Search character' })
  @IsString()
  @IsOptional()
  search: string;

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

export class ResourceListReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Parent ID' })
  @IsString()
  @Length(20, 20)
  parentFolderId: string;

  @JSONSchema({ description: 'Search character' })
  @IsString()
  @IsOptional()
  search: string;

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

export class ResourceContent {
  @JSONSchema({ description: 'Resource address' })
  @IsString()
  realPath: string;

  @JSONSchema({ description: 'Resource download address' })
  @IsString()
  @IsOptional()
  downloadPath: string;
}

export class AddResourceContentReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Folder ID' })
  @IsString()
  @Length(20, 20)
  folderId: string;

  @JSONSchema({ description: 'Resource content' })
  @ValidateNested()
  @Type(() => ResourceContent)
  content: ResourceContent;

  // @JSONSchema({ description:'Resource URL list' })
  // @IsArray()
  // @IsOptional()
  // urls: Array<string>;
}

export class UpdateResourceContentReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'File ID' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'File content' })
  @ValidateNested()
  @Type(() => ResourceContent)
  content: ResourceContent;
}

export class ResourceDetailReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Resource folder ID' })
  @IsString()
  @Length(20, 20)
  @IsOptional()
  id: string;

  @JSONSchema({ description: 'Resource name' })
  @IsString()
  @IsOptional()
  name: string;

  // @JSONSchema({ description:'Resource path' })
  // @IsString()
  // @IsOptional()
  // path: string;
}

export class UpdateResourceFolderReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Folder ID' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'Folder name' })
  @IsString()
  @IsOptional()
  @Length(0, 100)
  name: string;

  @JSONSchema({ description: 'Introduction to Folder' })
  @IsString()
  @IsOptional()
  intro: string;

  // @JSONSchema({ description:'Folder path' })
  // @IsString()
  // @IsOptional()
  // path: string;
}

export class ResourcePathDetailReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Resource path' })
  @IsString()
  @IsOptional()
  path: string;

  @JSONSchema({ description: 'The number of layers of resource subsets, only return 5 layers at most' })
  @IsNumber()
  @IsOptional()
  depth: number;
}

export class ResourceContentDetailReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Resource file content ID' })
  @IsString()
  @Length(20, 20)
  @IsOptional()
  id: string;

  @JSONSchema({ description: 'Resource file ID' })
  @IsString()
  @Length(20, 20)
  @IsOptional()
  fileId: string;
}

export class ResourceContentListReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Resource file ID', default: 'Resource file ID' })
  @IsString()
  @Length(20, 20)
  id: string;
}

export class ResourceInfoReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Resource folder ID', default: 'Resource folder ID' })
  @IsString()
  @IsOptional()
  id: string;

  @JSONSchema({ description: 'Resource path' })
  @IsString()
  @IsOptional()
  path: string;
}

export class ResourceGroupReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Resource group ID', default: 'Resource group ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Resource search test' })
  @IsString()
  @IsOptional()
  name: string;
}

export class NewResourceDetail {
  @JSONSchema({ description: 'Resource name' })
  @IsString()
  name: string;

  @JSONSchema({ description: 'Resource version' })
  @IsString()
  version: string;

  @JSONSchema({ description: 'Resource folder name' })
  @IsString()
  resourceName: string;

  @JSONSchema({ description: 'current resource version is new or not' })
  @IsBoolean()
  isNew: boolean;

  @JSONSchema({ description: 'Resource files' })
  @IsString()
  files: object;

  @JSONSchema({ description: 'Resource meta' })
  @IsObject()
  @IsOptional()
  meta: object;

  @JSONSchema({ description: 'Resource schema' })
  @IsObject()
  @IsOptional()
  schema: object;

  @JSONSchema({ description: 'Resource ID' })
  @IsString()
  @IsOptional()
  id: string;
}

export class SaveResourceListReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Resource group ID', default: 'Resource group ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Resource data list' })
  @IsArray()
  resources: Array<NewResourceDetail>;
}

export class UpdateResourceConfigReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Resource group ID' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'Resource group name' })
  @IsString()
  @Length(1, 100)
  name: string;

  @JSONSchema({ description: 'Resource group config' })
  @IsObject()
  config: object;

  @JSONSchema({ description: 'Resource group introduction' })
  @IsString()
  @IsOptional()
  intro: string;
}

export class ResourceRemoteURLReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Resource type name' })
  @IsString()
  resourceType: string;

  @JSONSchema({ description: 'Resource Group scope' })
  @IsString()
  @IsOptional()
  resourceScope: string;
}
