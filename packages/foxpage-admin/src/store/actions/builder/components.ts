import { createAction } from 'typesafe-actions';

import { Component } from '@/types/index';

export const clearAll = createAction('BUILDER_COMPONENT_LIST__CLEAR_ALL', () => ({}))();

export const fetchComponentList = createAction(
  'BUILDER_COMPONENT_LIST__FETCH_COMPONENT_LIST',
  (applicationId: string) => ({
    applicationId,
  }),
)();

export const pushComponentList = createAction(
  'BUILDER_COMPONENT_LIST__PUSH_COMPONENT_LIST',
  (data: Component[]) => ({
    data,
  }),
)();

export const updateLoading = createAction('BUILDER_COMPONENT_LIST__UPDATE_LOADING', (loading: boolean) => ({
  loading,
}))();
