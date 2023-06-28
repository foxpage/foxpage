import { createAction } from 'typesafe-actions';

import {
  Component,
  ComponentVersionDetailsFetchedRes,
  ComponentVersionDetailsFetchParams,
  ComponentVersionFetchParams,
  Content,
} from '@/types/index';

export const clearAll = createAction('BUILDER_COMPONENT_LIST__CLEAR_ALL', () => ({}))();

export const fetchComponentList = createAction(
  'BUILDER_COMPONENT_LIST__FETCH_COMPONENT_LIST',
  (applicationId: string, locale: string) => ({
    applicationId,
    locale,
  }),
)();

export const pushComponentList = createAction(
  'BUILDER_COMPONENT_LIST__PUSH_COMPONENT_LIST',
  (data: Component[]) => ({
    data,
  }),
)();

export const pushBlockDSL = createAction(
  'BUILDER_COMPONENT_LIST__PUSH_BLOCK_DSL',
  (data: Record<string, Content>) => ({
    data,
  }),
)();

export const updateLoading = createAction('BUILDER_COMPONENT_LIST__UPDATE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const fetchComponentVersions = createAction(
  'BUILDER_COMPONENT_LIST__FETCH_COMPONENT_VERSIONS',
  (params: ComponentVersionFetchParams) => ({
    params,
  }),
)();

export const pushComponentVersions = createAction(
  'BUILDER_COMPONENT_LIST__PUSH_COMPONENT_VERSIONS',
  (list: Component[] = []) => ({
    list,
  }),
)();

export const fetchComponentVersionDetails = createAction(
  'BUILDER_COMPONENT_LIST__FETCH_COMPONENT_VERSION_DETAILS',
  (params: ComponentVersionDetailsFetchParams) => ({
    params,
  }),
)();

export const pushComponentVersionDetails = createAction(
  'BUILDER_COMPONENT_LIST__PUSH_COMPONENT_VERSION_DETAILS',
  (list: ComponentVersionDetailsFetchedRes['data'] = []) => ({
    list,
  }),
)();
