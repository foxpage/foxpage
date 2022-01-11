import { UserRegisterParams, UserRegisterResult } from '@/types/user';
import FoxpageApi from '@/utils/foxpage-api-sdk';

export const register = (params: UserRegisterParams): Promise<UserRegisterResult> =>
  new Promise(resolve => {
    FoxpageApi.post('/users/register', params, (rs: UserRegisterResult) => {
      resolve(rs);
    });
  });
