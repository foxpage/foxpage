import { createAction } from 'typesafe-actions';

import { FileTypeEnum } from '@/constants/index';
import {
  Application,
  GoodsAddParams,
  PaginationInfo,
  PaginationReqParams,
  StorePackageResource,
  StoreProjectResource,
  StoreResourceSearchParams,
} from '@/types/index';

export const clearAll = createAction('STORE_CLEAR_ALL', () => ({}))();

export const updateLoading = createAction('STORE__UPDATE_LOADING', (loading: boolean) => ({ loading }))();

export const fetchStoreResources = createAction(
  'STORE__FETCH_STORE_RESOURCE__LIST',
  (params: StoreResourceSearchParams) => ({
    ...params,
  }),
)();

export const pushProjectStoreResources = createAction(
  'STORE__PUSH_STORE_RESOURCE__LIST',
  (list: StoreProjectResource[], pageInfo: PaginationInfo) => ({
    list,
    pageInfo,
  }),
)();

export const pushPackageStoreResources = createAction(
  'STORE__PUSH_STORE_PACKAGE_RESOURCE__LIST',
  (list: StorePackageResource[], pageInfo: PaginationInfo) => ({
    list,
    pageInfo,
  }),
)();

export const updatePreviewModalVisible = createAction(
  'STORE__UPDATE_PREVIEW_MODAL_VISIBLE',
  (visible: boolean, resourceItem?: any) => ({
    visible,
    resourceItem,
  }),
)();

export const updateBuyModalVisible = createAction(
  'STORE__UPDATE_BUY_MODAL_VISIBLE',
  (visible: boolean, ids?: string[]) => ({
    visible,
    ids,
  }),
)();

export const updateProjectResourceItemChecked = createAction('STORE__UPDATE_RESOURCE_ITEM_CHECKED', (id: string) => ({
  id,
}))();

export const updatePackageResourceItemChecked = createAction(
  'STORE__UPDATE_PACKAGE_RESOURCE_ITEM_CHECKED',
  (id: string) => ({
    id,
  }),
)();

export const updateSearchText = createAction('STORE__UPDATE_SEARCH_TEXT', (text: string) => ({
  text,
}))();

export const updateSelectedAppIds = createAction('STORE__UPDATE_SELECTED_APP_IDS', (ids: string[]) => ({
  ids,
}))();

export const addGoods = createAction('STORE__ADD_GOODS', (params: GoodsAddParams) => ({
  ...params,
}))();

export const updateType = createAction('STORE__UPDATE_TYPE', (type: FileTypeEnum) => ({
  type,
}))();

export const fetchAllApplicationList = createAction(
  'STORE__FETCH_ALL_APPLICATION_LIST',
  (params: PaginationReqParams) => ({
    ...params,
  }),
)();

export const pushAllApplicationList = createAction('STORE__PUSH_ALL_APPLICATION_LIST', (list: Application[]) => ({
  list,
}))();
