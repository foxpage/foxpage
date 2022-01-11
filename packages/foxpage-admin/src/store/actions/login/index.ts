import { createAction } from 'typesafe-actions';

import { UserLoginParams } from '@/types/user';

export const login = createAction('USER_LOGIN', (userInfo: UserLoginParams) => ({
  ...userInfo,
}))();

export const updateLoginLoading = createAction('USER_UPDATE_LOGIN_LOADING', (loading: boolean) => ({
  loading,
}))();
