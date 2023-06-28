import { createAction } from 'typesafe-actions';

import { LoginParams } from '@/types/index';

export const login = createAction('SYSTEM_LOGIN__LOGIN', (userInfo: LoginParams) => ({
  ...userInfo,
}))();

export const updateLoading = createAction('SYSTEM_LOGIN__LOADING', (loading: boolean) => ({
  loading,
}))();
