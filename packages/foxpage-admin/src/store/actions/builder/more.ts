import { createAction } from 'typesafe-actions';

import {
  DslFetchParams,
  DslType,
  MockBuildDetailFetchParams,
  MockContent,
  MockNewParams,
  MockPublishParams,
  MockValueUpdateParams,
} from '@/types/builder';

export const clearAll = createAction('BUILDER_MORE__CLEAR_ALL', () => ({}))();

// dsl
export const updateDslModalOpen = createAction('BUILDER_MORE__UPDATE_DSL_MODAL_OPEN', (open: boolean) => ({
  open,
}))();

export const updateLoading = createAction('BUILDER_MORE__UPDATE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const fetchDsl = createAction('BUILDER_MORE__FETCH_DSL', (params: DslFetchParams) => ({
  ...params,
}))();

export const pushDsl = createAction('BUILDER_MORE__PUSH_DSL', (dsl: DslType) => ({
  dsl,
}))();

// mock
export const updateMockModalVisible = createAction(
  'BUILDER_MORE__UPDATE_MOCK_MODAL_VISIBLE',
  (status: boolean) => ({
    status,
  }),
)();

export const updateMockLoading = createAction('BUILDER_MORE__UPDATE_MOCK_LOADING', (status: boolean) => ({
  status,
}))();
export const updateMockMode = createAction('BUILDER_MORE__UPDATE_MOCK_MODE', (status: boolean) => ({
  status,
}))();

export const fetchMock = createAction('BUILDER_MORE__FETCH_MOCK', (params: MockBuildDetailFetchParams) => ({
  ...params,
}))();
export const pushMock = createAction('BUILDER_MORE__PUSH_MOCK', (mock: MockContent) => ({
  mock,
}))();
export const updateMockId = createAction('BUILDER_MORE__UPDATE_MOCK_ID', (id: string) => ({
  id,
}))();
export const updateMock = createAction('BUILDER_MORE__UPDATE_MOCK', (params: MockValueUpdateParams) => ({
  params,
}))();
export const addMock = createAction(
  'BUILDER_MORE__ADD_MOCK',
  (params: MockNewParams, cb?: (versionId?: string) => void) => ({
    params,
    cb,
  }),
)();
export const publishMock = createAction(
  'BUILDER_MORE__PUBLISH_MOCK',
  (params: MockPublishParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();
