import { createAction } from 'typesafe-actions';

import { ApplicationStoreGoodsSearchParams, Template } from '@/types/builder';
import { PaginationInfo, StoreProjectResource } from '@/types/index';

export const fetchApplicationTemplate = createAction(
  'BUILDER_TEMPLATE__FETCH_APPLICATION_TEMPLATE',
  (applicationId: string) => ({
    applicationId,
  }),
)();

export const fetchStoreProjectGoods = createAction(
  'BUILDER_TEMPLATE__FETCH_STORE_PAGE',
  (params: ApplicationStoreGoodsSearchParams) => ({
    ...params,
  }),
)();

export const pushTemplates = createAction(
  'BUILDER_TEMPLATE__FETCH_CAN_USE_TEMPLATE_SUCCESS',
  (templates: Template[]) => ({
    templates,
  }),
)();

export const pushStoreProjectGoods = createAction(
  'BUILDER_TEMPLATE__PUSH_STORE_PROJECT_GOODS',
  (resourceList: StoreProjectResource[], pageInfo: PaginationInfo) => ({
    resourceList,
    pageInfo,
  }),
)();

export const updatePageTemplateSelectModalOpen = createAction(
  'BUILDER_TEMPLATE__UPDATE_TEMPLATE_SELECT_MODAL_OPEN',
  (value: boolean) => ({
    value,
  }),
)();

export const updateComponentTemplateSelectModalOpen = createAction(
  'BUILDER_TEMPLATE__UPDATE_COMPONENT_TEMPLATE_SELECT_MODAL_OPEN',
  (value: boolean) => ({
    value,
  }),
)();

export const updateTemplateFetchLoading = createAction(
  'BUILDER_TEMPLATE__UPDATE_TEMPLATE_FETCH_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const updatePageCopyModalOpen = createAction(
  'BUILDER_TEMPLATE__UPDATE_PAGE_COPY_MODAL_OPEN',
  (value: boolean) => ({
    value,
  }),
)();
