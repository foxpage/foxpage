import { createAction } from 'typesafe-actions';

import { ScreenshotFetchParams, Screenshots } from '@/types/index';

export const clearAll = createAction('SCREENSHOT__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction('SCREENSHOT__SET_FILE_LOADING', (status: boolean) => ({
  status,
}))();

export const fetchScreenshots = createAction(
  'SCREENSHOT__FETCH_SCREENSHOT',
  (params: ScreenshotFetchParams) => ({
    params,
  }),
)();

export const pushScreenshots = createAction('SCREENSHOT__PUSH_SCREENSHOT', (result: Screenshots) => ({
  result,
}))();
