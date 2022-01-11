import { UserLoginParams, UserLoginResult } from '@/types/user';
import FoxpageApi from '@/utils/foxpage-api-sdk';

export const login = (params: UserLoginParams): Promise<UserLoginResult> =>
  new Promise(resolve => {
    FoxpageApi.post('/users/login', params, (rs: UserLoginResult) => {
      resolve(rs);
    });
  });
