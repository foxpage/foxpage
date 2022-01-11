import { createAction } from 'typesafe-actions';

import { ComponentType } from '@/types/builder';

export const fetchComponentList = createAction(
  'BUILDER_COMPONENT_LIST__FETCH_COMPONENT_LIST',
  (applicationId: string) => ({
    applicationId,
  }),
)();

export const pushComponentList = createAction(
  'BUILDER_COMPONENT_LIST__FETCH_COMPONENT_LIST_SUCCESS',
  (data: ComponentType[]) => ({
    data,
  }),
)();

export const updateComponentListLoading = createAction(
  'BUILDER_COMPONENT_LIST__FETCH_COMPONENT_LIST_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();
