import { LoginParams, LoginResponse } from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const login = (params: LoginParams): Promise<LoginResponse> =>
  new Promise((resolve) => {
    FoxPageApi.post('/users/login', params, (rs: LoginResponse) => {
      resolve(rs);
    });
  });
