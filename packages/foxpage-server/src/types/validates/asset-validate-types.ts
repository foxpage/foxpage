import { IsNumber, IsObject, IsOptional, IsString, Length, Min } from 'class-validator';
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

export class ResourceFolderDetailRes extends FolderDetailRes {}

export class ResourceListReq {
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

export class AddResourceContentReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'File ID' })
  @IsString()
  @Length(20, 20)
  fileId: string;

  @JSONSchema({ description: 'File content' })
  @IsObject()
  content: object;
}

export class UpdateResourceContentReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Content ID' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'File content' })
  @IsObject()
  content: object;
}
