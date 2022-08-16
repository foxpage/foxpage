import { LoginParams, LoginReturn } from './login';
import { User } from './user';

export type RegisterParams = Pick<User, 'email'> & LoginParams;

export type RegisterResult = Pick<LoginReturn, 'token' | 'userInfo'>;
