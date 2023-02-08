import { createAction } from 'typesafe-actions';

import { ContentVersion, ContentVersionsParams, HistoryFetchParams, HistoryRecord } from '@/types/index';

export const fetchHistoriesByVersion = createAction(
  'RECORD__GET_USER_HISTORY',
  (params: HistoryFetchParams, version) => ({
    params,
    version,
  }),
)();

export const initHistory = createAction(
  'HISTORY__INIT',
  (params: ContentVersionsParams, versionId?: string) => ({ params, versionId }),
)();

export const updateLoading = createAction('HISTORY__UPDATE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const pushHistories = createAction('HISTORY__PUSH_USER_RECORD', (data: HistoryRecord) => ({
  data,
}))();

export const updateVersionsList = createAction('HISTORY__UPDATE_VERSION_LIST', (list: ContentVersion[]) => ({
  list,
}))();

export const resetHistory = createAction('HISTORY__RESET', () => ({}))();

export const updateListIndex = createAction('HISTORY__UPDATE_INDEX', (position: number) => ({ position }))();
