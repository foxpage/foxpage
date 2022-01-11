import { createAction } from 'typesafe-actions';

import { Application, ApplicationEditType } from '@/types/application';

export const fetchApplicationInfo = createAction(
  'ORGANIZATION_APPLICATION__SETTING_FETCH_APPLICATION_INFO',
  (applicationId: string) => ({
    applicationId,
  }),
)();

export const pushApplicationInfo = createAction(
  'ORGANIZATION_APPLICATION__SETTING_PUSH_APPLICATION_INFO',
  (application: Application) => ({
    application,
  }),
)();

export const fetchAllLocales = createAction(
  'ORGANIZATION_APPLICATION__SETTING_FETCH_ALL_LOCALES',
  (applicationId: string) => ({
    applicationId,
  }),
)();

export const pushAllLocales = createAction(
  'ORGANIZATION_APPLICATION__SETTING_PUSH_ALL_LOCALES',
  (locales: string[]) => ({
    locales,
  }),
)();

export const updateLoading = createAction('ORGANIZATION_APPLICATION__SETTING_UPDATE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const clearAll = createAction('ORGANIZATION_APPLICATION__SETTING_CLEAR_APP', () => ({}))();

export const saveApplication = createAction(
  'ORGANIZATION_APPLICATION__SETTING_SAVE_APPLICATION',
  (application: ApplicationEditType) => ({
    ...application,
  }),
)();
