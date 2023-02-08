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

import { AppFolderTypes, FileTypes } from '@foxpage/foxpage-server-types';

import { AppInfo } from './app-validate-types';
import { CreatorInfo, ResponseBase, ResponsePageBase } from './index-validate-types';

export class FolderDetail {
  @JSONSchema({ description: 'Folder ID' })
  @IsString()
  @IsOptional()
  id: string;

  @JSONSchema({ description: 'Folder name' })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  name: string;

  @JSONSchema({ description: 'Introduction to Folder' })
  @IsString()
  @IsOptional()
  intro: string;

  @JSONSchema({ description: 'Application to which the folder belongs' })
  @ValidateNested()
  application: AppInfo;

  @JSONSchema({ description: 'Folder parent folder ID' })
  @IsString()
  @IsOptional()
  @Length(0, 20)
  folder: string;

  @JSONSchema({ description: 'Folder creator' })
  @ValidateNested()
  creator: CreatorInfo;

  @JSONSchema({ description: 'Created time' })
  @IsDate()
  @IsOptional()
  createTime: Date;

  @JSONSchema({ description: 'Update time' })
  @IsDate()
  @IsOptional()
  updateTime: Date;

  @JSONSchema({ description: 'Delete status' })
  @IsBoolean()
  @IsOptional()
  deleted: Boolean;
}

export class FileDetail {
  @JSONSchema({ description: 'File ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @JSONSchema({ description: 'File name' })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  name: string;

  @JSONSchema({ description: 'File introduction' })
  @IsString()
  @IsOptional()
  intro: string;

  @JSONSchema({ description: 'Application to which the file belongs' })
  @ValidateNested()
  application: AppInfo;

  @JSONSchema({ description: 'File type' })
  @IsString()
  @IsOptional()
  type: string;

  @JSONSchema({ description: 'File suffix' })
  @IsString()
  @IsOptional()
  suffix: string;

  @JSONSchema({ description: 'File parent folder ID' })
  @IsString()
  @IsOptional()
  @Length(0, 20)
  folderId: string;

  @JSONSchema({ description: 'File creator' })
  @ValidateNested()
  creator: CreatorInfo;

  @JSONSchema({ description: 'Created time' })
  @IsDate()
  @IsOptional()
  createTime?: Date;

  @JSONSchema({ description: 'Update time' })
  @IsDate()
  @IsOptional()
  updateTime?: Date;

  @JSONSchema({ description: 'Delete status' })
  @IsBoolean()
  @IsOptional()
  deleted?: Boolean;
}

export class FileBaseDetail {
  @JSONSchema({ description: 'File ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @JSONSchema({ description: 'File name' })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  name: string;

  @JSONSchema({ description: 'File introduction' })
  @IsString()
  @IsOptional()
  intro: string;

  @JSONSchema({ description: 'Application to which the file belongs' })
  @IsString()
  application: string;

  @JSONSchema({ description: 'File type' })
  @IsString()
  @IsOptional()
  type: string;

  @JSONSchema({ description: 'File suffix' })
  @IsString()
  @IsOptional()
  suffix: string;

  @JSONSchema({ description: 'File parent folder ID' })
  @IsString()
  @IsOptional()
  @Length(0, 20)
  folderId: string;

  @JSONSchema({ description: 'File creator' })
  @IsString()
  creator: string;

  @JSONSchema({ description: 'Created time' })
  @IsDate()
  @IsOptional()
  createTime?: Date;

  @JSONSchema({ description: 'Update time' })
  @IsDate()
  @IsOptional()
  updateTime?: Date;

  @JSONSchema({ description: 'Delete status' })
  @IsBoolean()
  @IsOptional()
  deleted?: Boolean;
}

export class FolderAndFileDetail {
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  folders: FolderDetail;

  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  files: FileDetail;
}

export class FileListReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Folder ID' })
  @IsString()
  @Length(0, 20)
  @IsOptional()
  id: string;

  @JSONSchema({ description: 'File deleted status, default is false' })
  @IsBoolean()
  @IsOptional()
  deleted: boolean;

  @JSONSchema({ description: 'File type' })
  @IsString()
  @IsOptional()
  type: string;

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

export class AppFileListReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'File ID list' })
  @IsArray()
  ids: Array<string>;
}

export class FileListRes extends ResponsePageBase {
  @ValidateNested()
  @IsObject()
  data: FileDetail;
}

export class FolderListRes extends ResponsePageBase {
  @ValidateNested()
  @IsObject()
  data: FolderDetail;
}

export class FileFolderListRes extends ResponsePageBase {
  @ValidateNested()
  @IsObject()
  data: FolderAndFileDetail;
}

export class BreadcrumbDetail {
  @JSONSchema({ description: 'Level ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'level name' })
  @IsString()
  name: string;

  @JSONSchema({ description: 'Level type: folder/file/template, etc.' })
  @IsString()
  type: string;
}

export class FileBreadcrumbReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Folder ID' })
  @IsString()
  @Length(0, 24)
  @IsOptional()
  folderId: string;

  @JSONSchema({ description: 'Path' })
  @IsString()
  @IsOptional()
  path: string;
}

export class FileBreadcrumbRes extends ResponseBase {
  @ValidateNested({ each: true })
  @IsArray()
  data: BreadcrumbDetail;
}

export class FolderDetailReq {
  @JSONSchema({ description: 'Folder name' })
  @IsString()
  @Length(1, 100)
  name: string;

  @JSONSchema({ description: 'Introduction to Folder' })
  @IsString()
  @IsOptional()
  intro: string;

  @JSONSchema({ description: 'Application to which the folder belongs' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Folder type, item/variable/component etc.' })
  @IsString()
  @IsOptional()
  type: AppFolderTypes;

  @JSONSchema({ description: 'Folder parent folder ID' })
  @IsString()
  @Length(0, 20)
  @IsOptional()
  parentFolderId: string;
}

export class FolderDetailRes extends ResponseBase {
  @ValidateNested()
  @IsObject()
  data: FolderDetail;
}

export class FileDetailReq {
  @JSONSchema({ description: 'File name' })
  @IsString()
  @Length(1, 100)
  name: string;

  @JSONSchema({ description: 'File introduction' })
  @IsString()
  @IsOptional()
  intro: string;

  @JSONSchema({ description: 'Application to which the file belongs' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'File parent folder ID' })
  @IsString()
  @Length(0, 20)
  @IsOptional()
  folderId: string;

  @JSONSchema({ description: 'File type' })
  @IsString()
  @IsOptional()
  type: FileTypes;

  @JSONSchema({ description: 'File label' })
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  tags: Array<any>;

  @JSONSchema({ description: 'File suffix' })
  @IsString()
  @IsOptional()
  suffix: string;
}

export class FileVersionDetailReq {
  @JSONSchema({ description: 'Application to which the file belongs' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'File name' })
  @IsString()
  @Length(1, 100)
  name: string;

  @JSONSchema({ description: 'File introduction' })
  @IsString()
  @IsOptional()
  intro: string;

  @JSONSchema({ description: 'File parent folder ID' })
  @IsString()
  @Length(0, 20)
  @IsOptional()
  folderId: string;

  @JSONSchema({ description: 'The file assoc content id' })
  @IsString()
  @IsOptional()
  pageContentId: string;

  @JSONSchema({ description: 'File type' })
  @IsString()
  @IsOptional()
  type: FileTypes;

  @JSONSchema({ description: 'File sub type' })
  @IsString()
  @IsOptional()
  subType: string;

  @JSONSchema({ description: 'File suffix' })
  @IsString()
  @IsOptional()
  suffix: string;

  @JSONSchema({ description: 'File content' })
  @IsObject()
  @IsOptional()
  content: any;
}

export class FileDetailRes extends ResponseBase {
  @ValidateNested({ each: true })
  @IsArray()
  data: FileDetail;
}

export class FolderDeleteReq {
  @JSONSchema({ description: 'Folder ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Application to which the folder belongs' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'delete status value, true: delete, false: enable, default is true' })
  @IsBoolean()
  @IsOptional()
  status: boolean;
}

export class UpdateFileDetailReq {
  @JSONSchema({ description: 'Application to which the file belongs' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'File ID' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'File name' })
  @IsString()
  @Length(1, 100)
  name: string;

  @JSONSchema({ description: 'File introduction' })
  @IsString()
  @IsOptional()
  intro?: string;

  @JSONSchema({ description: 'File label' })
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  tags: Array<any>;

  @JSONSchema({ description: 'Depended file ID' })
  @IsString()
  @IsOptional()
  pageFileId: string;
}

export class UpdateTypeFileDetailReq {
  @JSONSchema({ description: 'Application to which the file belongs' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'File ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'File Cotnent ID' })
  @IsString()
  @IsOptional()
  contentId: string;

  @JSONSchema({ description: 'File name' })
  @IsString()
  @Length(1, 100)
  name: string;

  @JSONSchema({ description: 'File content version information' })
  @IsObject()
  content: any;

  @JSONSchema({ description: 'File introduction' })
  @IsString()
  @IsOptional()
  intro: string;

  @JSONSchema({ description: 'File type' })
  @IsString()
  @IsOptional()
  type: string;

  @JSONSchema({ description: 'Depended File ID' })
  @IsString()
  @IsOptional()
  pageFileId: string;
}

export class UpdateFolderDetailReq {
  @JSONSchema({ description: 'Folder ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Folder name' })
  @IsString()
  name: string;

  @JSONSchema({ description: 'Application to which the folder belongs' })
  @IsString()
  @Length(20, 20)
  applicationId: string;
}

export class DeleteFileReq {
  @JSONSchema({ description: 'File ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Application to which the file belongs' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'delete status value, true: delete, false: enable, default is true' })
  @IsBoolean()
  @IsOptional()
  status: boolean;
}

export class DeleteFolderReq {
  @JSONSchema({ description: 'Folder ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Application to which the folder belongs' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'delete status value, true: delete, false: enable, default is true' })
  @IsBoolean()
  @IsOptional()
  status: boolean;
}

export class PicTypeItem {
  @JSONSchema({ description: 'Picture url' })
  @IsString()
  url: string;

  @JSONSchema({ description: 'Item type' })
  @IsString()
  type: string;

  @JSONSchema({ description: 'Item sort' })
  @IsNumber()
  sort: number;
}

export class SetVersionPictureReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Item type id, default is version id' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'Item picture list' })
  @IsArray()
  @ValidateNested({ each: true })
  pictures: PicTypeItem[];
}

export class AddTypeFolderDetailReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Name' })
  @IsString()
  @Length(2, 100)
  name: string;

  @JSONSchema({ description: 'Introduction' })
  @IsString()
  @IsOptional()
  intro: string;

  @JSONSchema({ description: 'Path' })
  @IsString()
  @IsOptional()
  path: string;

  @JSONSchema({ description: 'Parent ID' })
  @IsString()
  @IsOptional()
  parentFolderId: string;

  @JSONSchema({ description: 'Folder label' })
  @IsArray()
  @IsOptional()
  tags: Array<object>;

  @JSONSchema({ description: 'Resource group config' })
  @IsObject()
  @IsOptional()
  config: object;
}

export class AddResourceGroupDetailReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Name' })
  @IsString()
  @Length(2, 100)
  name: string;

  @JSONSchema({ description: 'Parent ID' })
  @IsString()
  parentFolderId: string;

  @JSONSchema({ description: 'Introduction' })
  @IsString()
  @IsOptional()
  intro: string;

  @JSONSchema({ description: 'Path' })
  @IsString()
  @IsOptional()
  path: string;

  @JSONSchema({ description: 'Folder label' })
  @IsArray()
  @IsOptional()
  tags: Array<object>;
}

export class GetFileParentReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Target data ID' })
  @IsString()
  id: string;
}

export class AddMockReq extends FileVersionDetailReq {
  @JSONSchema({ description: 'Binding content ID' })
  @IsString()
  contentId: string;
}
