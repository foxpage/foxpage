import { createAction } from 'typesafe-actions';

import { Application, ApplicationEntityMultiHost } from '@/types/index';

export const clearAll = createAction('APPLICATION_SETTINGS_APP__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction('APPLICATION_SETTINGS_APP__UPDATE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const fetchApplicationInfo = createAction(
  'APPLICATION_SETTINGS_APP__FETCH_APPLICATION_INFO',
  (applicationId: string) => ({
    applicationId,
  }),
)();

export const pushApplicationInfo = createAction(
  'APPLICATION_SETTINGS_APP__PUSH_APPLICATION_INFO',
  (application: Application) => ({
    application,
  }),
)();

export const fetchAllLocales = createAction(
  'APPLICATION_SETTINGS_APP__FETCH_ALL_LOCALES',
  (applicationId: string) => ({
    applicationId,
  }),
)();

export const pushAllLocales = createAction(
  'APPLICATION_SETTINGS_APP__PUSH_ALL_LOCALES',
  (locales: string[]) => ({
    locales,
  }),
)();

export const saveApplication = createAction(
  'APPLICATION_SETTINGS_APP__SAVE_APPLICATION',
  (application: ApplicationEntityMultiHost) => ({
    application,
  }),
)();

export const updateApplicationId = createAction(
  'APPLICATION_SETTINGS_APP__UPDATE_APPLICATION_ID',
  (id: string) => ({
    id,
  }),
)();
