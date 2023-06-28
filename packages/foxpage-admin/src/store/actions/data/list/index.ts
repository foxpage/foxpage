import { createAction } from 'typesafe-actions';

import { DataBaseQueryParams } from '@/types/index';

export const clearAll = createAction('DATA__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction('DATA__UPDATE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const fetchCollectionList = createAction('DATA__COLLECTION_LIST', () => ({}))();

export const pushCollectionList = createAction('DATA__PUSH_COLLECTION_LIST', (list: string[]) => ({
  list,
}))();

export const queryDataBase = createAction('DATA__QUERY_DATA_BASE', (params: DataBaseQueryParams) => ({
  params,
}))();

export const pushDataBaseResult = createAction('DATA__PUSH_DATA_BASE_RESULT', (result: any) => ({
  result,
}))();
