import { createAction } from 'typesafe-actions';

import { FileType } from '@/constants/index';
import {
  Application,
  ApplicationListFetchParams,
  GoodsAddParams,
  PaginationInfo,
  PaginationReqParams,
  StorePackageResource,
  StoreProjectResource,
  StoreResourceSearchParams,
} from '@/types/index';

export const clearAll = createAction('STORE_CLEAR_ALL', () => ({}))();

export const updateLoading = createAction('STORE__UPDATE_LOADING', (loading: boolean) => ({ loading }))();

export const fetchResources = createAction('STORE__FETCH_RESOURCES', (params: StoreResourceSearchParams) => ({
  ...params,
}))();

export const pushProjectResources = createAction(
  'STORE__PUSH_PROJECT_RESOURCES',
  (list: StoreProjectResource[], pageInfo: PaginationInfo) => ({
    list,
    pageInfo,
  }),
)();

export const pushPackageResources = createAction(
  'STORE__PUSH_PACKAGE_RESOURCES',
  (list: StorePackageResource[], pageInfo: PaginationInfo) => ({
    list,
    pageInfo,
  }),
)();

export const pushVariableResources = createAction(
  'STORE__PUSH_VARIABLE_RESOURCES',
  (list: StorePackageResource[], pageInfo: PaginationInfo) => ({
    list,
    pageInfo,
  }),
)();

export const updateBuyModalVisible = createAction(
  'STORE__UPDATE_BUY_MODAL_VISIBLE',
  (visible: boolean, ids?: string[]) => ({
    visible,
    ids,
  }),
)();

export const updatePreviewModalVisible = createAction(
  'STORE__UPDATE_PREVIEW_MODAL_VISIBLE',
  (visible: boolean, resourceItem?: any) => ({
    visible,
    resourceItem,
  }),
)();

export const updateProjectResourceItemChecked = createAction(
  'STORE__UPDATE_RESOURCE_ITEM_CHECKED',
  (id: string) => ({
    id,
  }),
)();

export const updatePackageResourceItemChecked = createAction(
  'STORE__UPDATE_PACKAGE_RESOURCE_ITEM_CHECKED',
  (id: string) => ({
    id,
  }),
)();

export const updateVariableResourceItemChecked = createAction(
  'STORE__UPDATE_VARIABLE_RESOURCE_ITEM_CHECKED',
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

export const updateType = createAction('STORE__UPDATE_TYPE', (type: FileType) => ({
  type,
}))();

// application relation
export const fetchApplicationList = createAction(
  'STORE__FETCH_APPLICATION_LIST',
  (params: ApplicationListFetchParams) => ({
    params,
  }),
)();

export const pushApplicationList = createAction('STORE__PUSH_APPLICATION_LIST', (list: Application[]) => ({
  list,
}))();

export const fetchAllApplicationList = createAction(
  'STORE__FETCH_ALL_APPLICATION_LIST',
  (params: PaginationReqParams) => ({
    ...params,
  }),
)();

export const pushAllApplicationList = createAction(
  'STORE__PUSH_ALL_APPLICATION_LIST',
  (list: Application[]) => ({
    list,
  }),
)();

// common goods
export const addGoods = createAction('STORE__ADD_GOODS', (params: GoodsAddParams) => ({
  ...params,
}))();
