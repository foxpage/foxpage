import { createAction } from 'typesafe-actions';

import { UserRegisterParams } from '@/types/user';

export const register = createAction('USER_REGISTER', (userInfo: UserRegisterParams) => ({
  ...userInfo,
}))();

export const updateRegisterLoading = createAction('USER_UPDATE_REGISTER_LOADING', (loading: boolean) => ({
  loading,
}))();
