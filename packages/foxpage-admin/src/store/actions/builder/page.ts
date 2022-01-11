import { createAction } from 'typesafe-actions';

import { FileDetailFetchParams, FileType } from '@/types/application/file';
import { PageContentType, PageParam } from '@/types/builder';

export const fetchPageList = createAction('BUILDER_PAGE__FETCH_PAGE_LIST', (params: PageParam) => ({
  ...params,
}))();

export const pushPageList = createAction('BUILDER_PAGE__FETCH_PAGE_LIST_SUCCESS', (data: PageContentType[]) => ({
  data,
}))();

export const setContentId = createAction('BUILDER_PAGE__SET_CONTENT_ID', (params: PageParam) => ({
  ...params,
}))();

export const setLocale = createAction('BUILDER_PAGE__SET_LOCALE', (locale: string) => ({
  locale,
}))();

export const selectContent = createAction('BUILDER_PAGE__SELECT_CONTENT', (params: PageParam) => ({
  ...params,
}))();

export const setFileFoldStatus = createAction('BUILDER_SET_FILE_FOLD_STATUS', (id: string, fold = false) => ({
  id,
  fold,
}))();

export const setLoadingStatus = createAction('BUILDER_PAGE__SET_FETCH_PAGE_LIST_LOADING', (value = false) => ({
  value,
}))();

export const fetchFileDetail = createAction('BUILDER_PAGE__FETCH_FILE_DETAIL', (params: FileDetailFetchParams) => ({
  ...params,
}))();

export const pushFileDetail = createAction('BUILDER_PAGE__PUSH__FILE_DETAIL', (data: FileType) => ({
  data,
}))();
