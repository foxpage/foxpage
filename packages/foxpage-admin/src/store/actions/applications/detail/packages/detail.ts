import { createAction } from 'typesafe-actions';

import { InitialDataType } from '@/reducers/applications/detail/packages/detail';
import {
  AppComponentDetailAddComponentVersionParams,
  AppComponentDetailEditComponentVersionParams,
  AppComponentDetailFetchComponentInfoParams,
  AppComponentDetailFetchComponentVersionsParams,
  AppComponentDetailLiveComponentVersionParams,
  AppComponentDetailUpdateComponentVersionStatueParams,
  ComponentDisabledSaveParams,
  ComponentEditVersionEntity,
  ComponentRemote,
  ComponentRemoteSaveParams,
  ComponentsReferLiveVersionUpdateParams,
  FilesFetchParams,
  OptionsAction,
  RemoteComponentFetchParams,
} from '@/types/index';

export const clearAll = createAction('APPLICATION_PACKAGES_DETAIL__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction(
  'APPLICATION_PACKAGES_DETAIL__UPDATE_LOADING',
  (loading: boolean) => ({ loading }),
)();

export const updateDetailState = createAction(
  'APPLICATION_PACKAGES_DETAIL__UPDATE_STATE',
  (params: Partial<InitialDataType>) => ({
    params,
  }),
)();

export const updateComponentInfoState = createAction(
  'APPLICATION_PACKAGES_DETAIL__UPDATE_COMPONENT_INFO_STATE',
  (params: Partial<InitialDataType['componentInfo']>) => ({
    params,
  }),
)();
export const resetComponentInfoState = createAction(
  'APPLICATION_PACKAGES_DETAIL__RESET_COMPONENT_INFO_STATE',
  () => ({}),
)();

export const updateVersionListState = createAction(
  'APPLICATION_PACKAGES_DETAIL__UPDATE_VERSION_LIST_STATE',
  (params: Partial<InitialDataType['versionList']>) => ({
    params,
  }),
)();
export const resetVersionListState = createAction(
  'APPLICATION_PACKAGES_DETAIL__RESET_VERSION_LIST_STATE',
  () => ({}),
)();

export const updateVersionDrawerState = createAction(
  'APPLICATION_PACKAGES_DETAIL__UPDATE_VERSION_DRAWER_STATE',
  (params: Partial<InitialDataType['versionDrawer']>) => ({
    params,
  }),
)();

export const resetVersionDrawerState = createAction(
  'APPLICATION_PACKAGES_DETAIL__RESET_VERSION_DRAWER_STATE',
  () => ({}),
)();

// actions
export const fetchComponentInfoAction = createAction(
  'APPLICATION_PACKAGES_DETAIL__FETCH_COMPONENT_INFO_API',
  (params: AppComponentDetailFetchComponentInfoParams, options?: OptionsAction) => ({ params, options }),
)();

export const fetchComponentVersionsAction = createAction(
  'APPLICATION_PACKAGES_DETAIL__FETCH_COMPONENT_VERSIONS_API',
  (params: AppComponentDetailFetchComponentVersionsParams, options?: OptionsAction) => ({ params, options }),
)();

export const addComponentVersionAction = createAction(
  'APPLICATION_PACKAGES_DETAIL__ADD_COMPONENT_VERSION_API',
  (params: AppComponentDetailAddComponentVersionParams, options?: OptionsAction) => ({ params, options }),
)();

export const editComponentVersionAction = createAction(
  'APPLICATION_PACKAGES_DETAIL__EDIT_COMPONENT_VERSION_API',
  (params: AppComponentDetailEditComponentVersionParams, options?: OptionsAction) => ({ params, options }),
)();

export const updateComponentVersionStatusAction = createAction(
  'APPLICATION_PACKAGES_DETAIL__UPDATE_COMPONENT_VERSION_STATUS_API',
  (params: AppComponentDetailUpdateComponentVersionStatueParams, options?: OptionsAction) => ({
    params,
    options,
  }),
)();

export const liveComponentVersionAction = createAction(
  'APPLICATION_PACKAGES_DETAIL__LIVE_COMPONENT_VERSION_API',
  (params: AppComponentDetailLiveComponentVersionParams, options?: OptionsAction) => ({ params, options }),
)();

export const referLiveComponentVersionAction = createAction(
  'APPLICATION_PACKAGES_DETAIL__REFER_LIVE_COMPONENT_VERSION_API',
  (params: ComponentsReferLiveVersionUpdateParams, options?: OptionsAction) => ({ params, options }),
)();

export const updateComponentOnlineStatus = createAction(
  'APPLICATION_PACKAGES_DETAIL__UPDATE_COMPONENT_ONLINE_STATUS',
  (online: boolean) => ({ online }),
)();

export const fetchFileDetail = createAction(
  'APPLICATION_PACKAGES_DETAIL__FETCH_FILE_DETAIL',
  (params: FilesFetchParams) => ({ ...params }),
)();

export const pushFileDetail = createAction('APPLICATION_PACKAGES_DETAIL__PUSH_FILE_DETAIL', (data: File) => ({
  data,
}))();

export const updateCloudSyncDrawerOpenStatus = createAction(
  'APPLICATION_PACKAGES_DETAIL__UPDATE_SYNC_DRAWER_OPEN_STATUS',
  (open: boolean) => ({
    open,
  }),
)();

export const fetchComponentRemotes = createAction(
  'APPLICATION_PACKAGES_DETAIL__SEARCH_COMPONENT_REMOTES',
  (params: RemoteComponentFetchParams) => ({
    ...params,
  }),
)();

export const pushComponentRemotes = createAction(
  'APPLICATION_PACKAGES_DETAIL__PUSH_COMPONENT_REMOTES',
  (remote: ComponentRemote, lastVersion: ComponentEditVersionEntity) => ({
    remote,
    lastVersion,
  }),
)();

export const saveComponentRemote = createAction(
  'APPLICATION_PACKAGES_DETAIL__SAVE_COMPONENT_REMOTES',
  (params: ComponentRemoteSaveParams) => ({
    ...params,
  }),
)();

export const updateCloudSyncDrawerLoadingStatus = createAction(
  'APPLICATION_PACKAGES_DETAIL__UPDATE_SYNC_DRAWER_Loading_STATUS',
  (open: boolean) => ({
    open,
  }),
)();

// deps
export const fetchComponentUsed = createAction(
  'APPLICATION_PACKAGES_DETAIL__FETCH_COMPONENT_USED',
  (page?: number, size?: number, live?: boolean) => ({ page, size, live }),
)();

export const pushComponentUsed = createAction(
  'APPLICATION_PACKAGES_DETAIL__PUSH_COMPONENT_USED',
  (list: any[]) => ({ list }),
)();

// disabled
export const saveComponentDisabled = createAction(
  'APPLICATION_PACKAGES_DETAIL__SAVE_COMPONENT_DISABLED',
  (params: ComponentDisabledSaveParams, cb?: () => void) => ({ params, cb }),
)();
