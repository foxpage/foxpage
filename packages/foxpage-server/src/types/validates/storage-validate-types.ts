import { IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

export class StorageListReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Object prefix' })
  @IsString()
  prefix: string;

  @JSONSchema({ description: 'Target bucket' })
  @IsString()
  @IsOptional()
  bucket: string;

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

export class DownloadObjectsReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Object prefix' })
  @IsString()
  prefix: string;
}

export class UploadObjectsReq {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  @Length(20, 20)
  applicationId: string;

  @JSONSchema({ description: 'Origin Object prefix' })
  @IsString()
  prefix: string;

  @JSONSchema({ description: 'Origin Object bucket' })
  @IsString()
  @IsOptional()
  bucket: string;

  @JSONSchema({ description: 'Target Object bucket' })
  @IsString()
  @IsOptional()
  targetBucket: string;

  @JSONSchema({ description: 'Target Object prefix' })
  @IsString()
  @IsOptional()
  targetPrefix: string;
}
