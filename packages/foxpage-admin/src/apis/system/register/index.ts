import { RegisterParams, RegisterResult } from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const register = (params: RegisterParams): Promise<RegisterResult> =>
  new Promise((resolve) => {
    FoxPageApi.post('/users/register', params, (rs: RegisterResult) => {
      resolve(rs);
    });
  });
