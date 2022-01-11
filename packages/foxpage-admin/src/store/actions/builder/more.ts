import { createAction } from 'typesafe-actions';

import { DslType } from '@/types/builder';
import { DslFetchParams } from '@/types/builder/more';

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
