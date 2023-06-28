import { LoginOptionsAction, LoginReturn, ResponseBody } from '@foxpage/foxpage-client-types';

export interface LoginParams extends LoginOptionsAction<LoginReturn> {
  account: string;
  password: string;
  type: number;
}

export interface LoginResponse extends ResponseBody<LoginReturn> {}
