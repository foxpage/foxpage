import { IsArray, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

import { PagingReq, ResponseBase } from './index-validate-types';

export class UploadPictureReq {
  @JSONSchema({ description: 'Picture base64 string' })
  @IsString()
  base64Str: string;

  @JSONSchema({ description: 'Picture name' })
  @IsOptional()
  @IsString()
  name: string;
}

export class PictureUrl {
  @JSONSchema({ description: 'Picture url' })
  @IsString()
  url: string;

  @JSONSchema({ description: 'Picture name' })
  @IsString()
  pictureName: string;
}

export class ItemPictures {
  @JSONSchema({ description: 'Application id' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Item type, file|content|version' })
  @IsString()
  type: string;

  @JSONSchema({ description: 'Item type id list' })
  @IsArray()
  typeIds: string[];
}

export class UploadPictureRes extends ResponseBase {
  @ValidateNested()
  @IsObject()
  data: PictureUrl;
}

export class PicInfo {
  @JSONSchema({ description: 'Picture name' })
  @IsString()
  name: string;

  @JSONSchema({ description: 'Picture url' })
  @IsString()
  url: string;
}

export class AddItemPicturesReq {
  @JSONSchema({ description: 'Application id' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Project id' })
  @IsString()
  @IsOptional()
  projectId: string;

  @JSONSchema({ description: 'File id' })
  @IsString()
  @IsOptional()
  fileId: string;

  @JSONSchema({ description: 'Content id' })
  @IsString()
  @IsOptional()
  contentId: string;

  @JSONSchema({ description: 'Item picture info list' })
  @IsArray()
  pictures: PicInfo[];
}

export class SetPictureStatusReq {
  @JSONSchema({ description: 'Application id' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Picture url' })
  @IsArray()
  ids: string[];
}

export class GetPagePictureReq extends PagingReq {
  @JSONSchema({ description: 'Application id' })
  @IsString()
  applicationId: string;

  @JSONSchema({ description: 'Picture type application|project|file|content|user' })
  @IsString()
  type: string;

  @JSONSchema({ description: 'Type id' })
  @IsString()
  @IsOptional()
  typeId: string;

  @JSONSchema({ description: 'Picture locale' })
  @IsString()
  @IsOptional()
  locale: string;

  @JSONSchema({ description: 'Picture name' })
  @IsString()
  @IsOptional()
  search: string;
}
