import { LoginReturn, User } from '@foxpage/foxpage-client-types';

import { LoginParams } from './login';

export type RegisterParams = Pick<User, 'email'> & LoginParams;

export type RegisterResult = Pick<LoginReturn, 'token' | 'userInfo'>;
