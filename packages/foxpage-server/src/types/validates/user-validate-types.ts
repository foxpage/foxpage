import { IsEmail, IsNotEmpty, IsObject, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

import { ResponseBase } from './index-validate-types';

export class UserBase {
  @JSONSchema({ description: 'User ID' })
  @IsString()
  id: string;

  @JSONSchema({ description: 'User Name' })
  @IsString()
  @Length(4, 30)
  account: string;

  @JSONSchema({ description: 'registered email' })
  @IsEmail()
  email: string;
}

export class RegisterReq {
  @JSONSchema({ description: 'User Name' })
  @IsString()
  @IsNotEmpty()
  @Length(4, 30)
  account: string = '';

  @JSONSchema({ description: 'registered email' })
  @IsEmail()
  @IsNotEmpty()
  email: string = '';

  @JSONSchema({ description: 'Password' })
  @IsNotEmpty()
  password: string;
}

export class RegisterResData {
  @JSONSchema({ description: 'User Name' })
  @IsString()
  @Length(4, 30)
  account: string = '';

  @JSONSchema({ description: 'registered email' })
  @IsEmail()
  email: string = '';
}

export class RegisterRes extends ResponseBase {
  @ValidateNested({ each: true })
  @IsObject()
  @IsOptional()
  data?: RegisterResData;
}

export class LoginReq {
  @JSONSchema({ description: 'User Name' })
  @IsNotEmpty()
  @Length(5, 30)
  account: string;

  @JSONSchema({ description: 'Password' })
  @IsNotEmpty()
  password: string;
}

export class LoginResData {
  @JSONSchema({ description: 'User Basic Information' })
  @ValidateNested()
  @IsObject()
  userInfo: UserBase;

  @JSONSchema({ description: 'Token' })
  @IsString()
  @IsNotEmpty()
  token: string = '';
}

export class LoginRes extends ResponseBase {
  @ValidateNested({ each: true })
  @IsObject()
  data?: LoginResData;
}

export class LoginKeyDetail {
  @JSONSchema({ description: 'public key' })
  @IsString()
  @IsNotEmpty()
  key: string = '';
}

export class LoginKeyRes extends ResponseBase {
  @ValidateNested({ each: true })
  @IsObject()
  data: LoginKeyDetail;
}

export class AddUserReq {
  @JSONSchema({ description: 'User Name' })
  @IsNotEmpty()
  @Length(1, 30)
  account: string;

  @JSONSchema({ description: 'User mailbox' })
  @IsNotEmpty()
  email: string;

  @JSONSchema({ description: 'User organization' })
  @IsNotEmpty()
  @Length(20, 20)
  organizationId: string;
}

export class AddUserResponseDetail {
  @JSONSchema({ description: 'User Name' })
  @IsNotEmpty()
  @Length(5, 30)
  account: string;

  @JSONSchema({ description: 'User mailbox' })
  @IsNotEmpty()
  email: string;

  @JSONSchema({ description: 'User password' })
  password: string;
}

export class AddUserRes extends ResponseBase {
  @ValidateNested({ each: true })
  @IsObject()
  data: AddUserResponseDetail;
}

export class UpdateUserPassword {
  @JSONSchema({ description: 'User ID' })
  @IsNotEmpty()
  @Length(20, 20)
  id: string;

  @JSONSchema({ description: 'User original password' })
  @IsNotEmpty()
  oldPassword: string;

  @JSONSchema({ description: 'User new password' })
  @IsNotEmpty()
  @Length(5, 50)
  newPassword: string;
}
