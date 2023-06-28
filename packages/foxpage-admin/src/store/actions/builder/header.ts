import { createAction } from 'typesafe-actions';

import {
  CatalogContentSelectParams,
  CatalogFetchParams,
  CatalogFetchResponse,
  HistoryState,
  MockNewParams,
  MockPublishParams,
  PageContent,
  PageTemplateFetchParams,
  PaginationInfo,
} from '@/types/index';

export const clearAll = createAction('BUILDER_HEADER__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction('BUILDER_HEADER__UPDATE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const updateLocale = createAction('BUILDER_HEADER__UPDATE_LOCALE', (locale: string) => ({
  locale,
}))();

export const updateEditorConfig = createAction(
  'BUILDER_HEADER__UPDATE_EDITOR_CONFIG',
  (params: Record<string, any>) => ({
    params,
  }),
)();

export const fetchCatalog = createAction('BUILDER_HEADER__FETCH_CATALOG', (params: CatalogFetchParams) => ({
  ...params,
}))();

export const pushCatalog = createAction('BUILDER_HEADER__PUSH_CATALOG', (data: CatalogFetchResponse) => ({
  data,
}))();

export const updateFileFold = createAction(
  'BUILDER_HEADER__UPDATE_FILE_FOLD',
  (id: string, fold = false) => ({
    id,
    fold,
  }),
)();

// after select new content
export const selectContent = createAction(
  'BUILDER_HEADER__SELECT_CONTENT',
  (params: CatalogContentSelectParams) => ({
    ...params,
  }),
)();

export const updateContentInfo = createAction(
  'BUILDER_HEADER__UPDATE_CONTENT_INFO',
  (params: CatalogContentSelectParams) => ({
    ...params,
  }),
)();

// store related
export const updateStoreLoading = createAction(
  'BUILDER_HEADER__UPDATE_STORE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const updateStoreModalVisible = createAction(
  'BUILDER_HEADER__UPDATE_PAGE_COPY_MODAL_VISIBLE',
  (open: boolean, type?: string) => ({
    open,
    type,
  }),
)();

export const fetchPageTemplate = createAction(
  'BUILDER_HEADER__FETCH_PAGE_TEMPLATE',
  (params: PageTemplateFetchParams) => ({
    params,
  }),
)();

export const pushPageTemplate = createAction(
  'BUILDER_HEADER__PUSH_PAGE_TEMPLATE',
  (list: any[], pageInfo: PaginationInfo) => ({
    list,
    pageInfo,
  }),
)();

// more
export const updateDSLLoading = createAction('BUILDER_HEADER__UPDATE_DSL_LOADING', (loading: boolean) => ({
  loading,
}))();

export const fetchDsl = createAction('BUILDER_HEADER__FETCH_DSL', (params) => ({
  ...params,
}))();

export const pushDsl = createAction('BUILDER_HEADER__PUSH_DSL', (dsl: PageContent) => ({
  dsl,
}))();

export const updateDSLModalVisible = createAction(
  'BUILDER_HEADER__UPDATE_DSL_MODAL_VISIBLE',
  (open: boolean) => ({
    open,
  }),
)();

// html related
export const updateHTMLLoading = createAction('BUILDER_HEADER__UPDATE_HTML_LOADING', (loading: boolean) => ({
  loading,
}))();

export const fetchHtml = createAction('BUILDER_HEADER__FETCH_HTML', (params) => ({
  ...params,
}))();

export const pushHtml = createAction('BUILDER_HEADER__PUSH_HTML', (html: string) => ({
  html,
}))();

export const updateHTMLModalVisible = createAction(
  'BUILDER_HEADER__UPDATE_HTML_MODAL_VISIBLE',
  (open: boolean) => ({
    open,
  }),
)();

// mock
export const updateMockLoading = createAction('BUILDER_HEADER__UPDATE_MOCK_LOADING', (loading: boolean) => ({
  loading,
}))();

export const updateMockModalVisible = createAction(
  'BUILDER_HEADER__UPDATE_MOCK_MODAL_VISIBLE',
  (open: boolean) => ({
    open,
  }),
)();

export const updateMockId = createAction('BUILDER_HEADER__UPDATE_MOCK_ID', (id: string) => ({
  id,
}))();

export const saveMock = createAction(
  'BUILDER_HEADER__SAVE_MOCK',
  (params: MockNewParams, cb?: (versionId?: string) => void) => ({
    params,
    cb,
  }),
)();

export const publishMock = createAction(
  'BUILDER_HEADER__PUBLISH_MOCK',
  (params: MockPublishParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

// for go back action
export const updateBackState = createAction('BUILDER_HEADER__UPDATE_BACK_STATE', (state?: HistoryState) => ({
  state,
}))();
