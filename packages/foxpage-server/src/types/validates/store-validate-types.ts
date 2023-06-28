import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

import { ResponsePageBase } from './index-validate-types';

export class StoreGoodsDetail {
  @JSONSchema({ description: 'Product ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'product name' })
  @IsString()
  name: string;

  @JSONSchema({ description: 'Product introduction' })
  @IsString()
  intro: string;

  @JSONSchema({ description: 'Product type' })
  @IsString()
  type: string;

  @JSONSchema({ description: 'Product details' })
  @IsString()
  detail: string;

  @JSONSchema({ description: 'Product status' })
  @IsString()
  status: number;

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

export class GetPageTemplateListReq {
  @JSONSchema({ description: 'Application ID' })
  @IsArray()
  @IsOptional()
  appIds: string[];

  @JSONSchema({ description: 'Filter goods source file type, default is empty' })
  @IsString()
  @IsOptional()
  type?: string;

  @JSONSchema({ description: 'Filter field, current page number' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @JSONSchema({ description: 'Filter fields, current data volume per page' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  size?: number;
}

export class GetPackageListReq {
  @JSONSchema({ description: 'Application ID' })
  @IsArray()
  @IsOptional()
  appIds: string[];

  @JSONSchema({ description: 'Filter goods source file type, default is empty' })
  @IsString()
  @IsOptional()
  type?: string;

  @JSONSchema({ description: 'Filter field, current page number' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @JSONSchema({ description: 'Filter fields, current data volume per page' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  size?: number;
}

export class GetFileListReq {
  @JSONSchema({ description: 'Product type' })
  @IsString()
  type: string;

  @JSONSchema({ description: 'Application ID' })
  @IsArray()
  @IsOptional()
  appIds: string[];

  @JSONSchema({ description: 'Filter fields, currently only filter by name' })
  @IsString()
  @IsOptional()
  search?: string;

  @JSONSchema({ description: 'Filter field, current page number' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @JSONSchema({ description: 'Filter fields, current data volume per page' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  size?: number;
}

export class GetPageTemplateListRes extends ResponsePageBase {
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  data: StoreGoodsDetail;
}

export class AddGoodsToApplicationReq {
  @JSONSchema({ description: 'Application ID' })
  @IsArray()
  appIds: string[];

  @JSONSchema({ description: 'Product ID' })
  @IsArray()
  goodsIds: string[];

  @JSONSchema({ description: 'Add type, clone|reference, default clone' })
  @IsString()
  @IsOptional()
  delivery: string;
}

export class AddGoodsItemTpApplicationReq extends AddGoodsToApplicationReq {
  @JSONSchema({ description: 'Item type, variable|condition|function..' })
  @IsString()
  type: string;
}

export class GetStorePackageListRes extends ResponsePageBase {
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  data: StoreGoodsDetail;
}

export class AddGoodsToStoreReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'File ID' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'Type' })
  @IsString()
  type: string;

  @JSONSchema({ description: 'Product introduction' })
  @IsString()
  @IsOptional()
  intro: string;
}

export class OfflineGoodsFromStoreReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'File ID' })
  @IsString()
  @Length(20, 20)
  id: string;
}
