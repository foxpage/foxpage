import { IsArray, IsNumber, IsOptional, IsString, Length, Min, ValidateNested } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

export class PagingReq {
  @JSONSchema({ description: 'Current page number' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number;

  @JSONSchema({ description: 'The maximum amount of data on the current page' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  size?: number;
}

export class PagingRes extends PagingReq {
  @JSONSchema({ description: 'Total data volume' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  total?: number;
}

export class ResponseBase {
  @JSONSchema({
    description:
      'Returning result status code: 200-success; 400-warning; 403-no permission; 500-system error',
  })
  @IsNumber()
  code: number = 200;

  @JSONSchema({ description: 'Return information' })
  @IsString()
  @IsOptional()
  msg?: string = '';

  @JSONSchema({ description: 'Return error message' })
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  err: string = '';
}

export class ResponsePageBase extends ResponseBase {
  @JSONSchema({ description: 'Return result paging data' })
  @ValidateNested()
  pageInfo: PagingRes;
}

export class CreatorInfo {
  @JSONSchema({ description: 'User ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'User Name' })
  @IsString()
  account: string;
}

export class App {
  @JSONSchema({ description: 'Application ID' })
  @IsString()
  applicationId: string;
}

export class ContentIdVersion {
  @JSONSchema({ description: 'Content ID' })
  @IsString()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'Content Version' })
  @IsString()
  version: string;
}
