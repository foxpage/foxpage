import { createAction } from 'typesafe-actions';

import { RegisterParams } from '@/types/index';

export const register = createAction(
  'SYSTEM_REGISTER__REGISTER',
  (userInfo: RegisterParams, cb?: () => void) => ({
    userInfo,
    cb,
  }),
)();

export const updateLoading = createAction('SYSTEM_REGISTER__LOADING', (loading: boolean) => ({
  loading,
}))();
