import { createAction } from 'typesafe-actions';

import { StateType } from '@/store/reducers/group/application/packages/detail';
import { FileDetailFetchParams, FileType } from '@/types/application/file';
import {
  AppComponentDetailAddComponentVersionParams,
  AppComponentDetailEditComponentVersionParams,
  AppComponentDetailFetchComponentInfoParams,
  AppComponentDetailFetchComponentVersionsParams,
  AppComponentDetailLiveComponentVersionParams,
  AppComponentDetailUpdateComponentVersionStatueParams,
  AppComponentEditVersionType,
  ComponentRemote,
  ComponentRemoteSaveParams,
  ComponentRemotesFetchParams,
  OptionsAction,
} from '@/types/index';
// state
export const updateDetailState = createAction(
  'ORG_APP_COMPONENT_DETAIL__UPDATE_STATE',
  (params: Partial<StateType>) => ({
    params,
  }),
)();
export const resetDetailState = createAction('ORG_APP_COMPONENT_DETAIL__RESET_STATE', () => ({}))();

export const updateComponentInfoState = createAction(
  'ORG_APP_COMPONENT_DETAIL__UPDATE_COMPONENT_INFO_STATE',
  (params: Partial<StateType['componentInfo']>) => ({
    params,
  }),
)();
export const resetComponentInfoState = createAction(
  'ORG_APP_COMPONENT_DETAIL__RESET_COMPONENT_INFO_STATE',
  () => ({}),
)();

export const updateVersionListState = createAction(
  'ORG_APP_COMPONENT_DETAIL__UPDATE_VERSION_LIST_STATE',
  (params: Partial<StateType['versionList']>) => ({
    params,
  }),
)();
export const resetVersionListState = createAction('ORG_APP_COMPONENT_DETAIL__RESET_VERSION_LIST_STATE', () => ({}))();

export const updateVersionDrawerState = createAction(
  'ORG_APP_COMPONENT_DETAIL__UPDATE_VERSION_DRAWER_STATE',
  (params: Partial<StateType['versionDrawer']>) => ({
    params,
  }),
)();
export const resetVersionDrawerState = createAction(
  'ORG_APP_COMPONENT_DETAIL__RESET_VERSION_DRAWER_STATE',
  () => ({}),
)();

// actions
export const fetchComponentInfoAction = createAction(
  'ORG_APP_COMPONENT_DETAIL__FETCH_COMPONENT_INFO_API',
  (params: AppComponentDetailFetchComponentInfoParams, options?: OptionsAction) => ({ params, options }),
)();

export const fetchComponentVersionsAction = createAction(
  'ORG_APP_COMPONENT_DETAIL__FETCH_COMPONENT_VERSIONS_API',
  (params: AppComponentDetailFetchComponentVersionsParams, options?: OptionsAction) => ({ params, options }),
)();

export const addComponentVersionAction = createAction(
  'ORG_APP_COMPONENT_DETAIL__ADD_COMPONENT_VERSION_API',
  (params: AppComponentDetailAddComponentVersionParams, options?: OptionsAction) => ({ params, options }),
)();

export const editComponentVersionAction = createAction(
  'ORG_APP_COMPONENT_DETAIL__EDIT_COMPONENT_VERSION_API',
  (params: AppComponentDetailEditComponentVersionParams, options?: OptionsAction) => ({ params, options }),
)();

export const updateComponentVersionStatusAction = createAction(
  'ORG_APP_COMPONENT_DETAIL__UPDATE_COMPONENT_VERSION_STATUS_API',
  (params: AppComponentDetailUpdateComponentVersionStatueParams, options?: OptionsAction) => ({ params, options }),
)();

export const liveComponentVersionAction = createAction(
  'ORG_APP_COMPONENT_DETAIL__LIVE_COMPONENT_VERSION_API',
  (params: AppComponentDetailLiveComponentVersionParams, options?: OptionsAction) => ({ params, options }),
)();

export const updateComponentOnlineStatus = createAction(
  'ORG_APP_COMPONENT_DETAIL__UPDATE_COMPONENT_ONLINE_STATUS',
  (online: boolean) => ({ online }),
)();

export const fetchFileDetail = createAction(
  'ORG_APP_COMPONENT_DETAIL__FETCH_FILE_DETAIL',
  (params: FileDetailFetchParams) => ({ ...params }),
)();

export const pushFileDetail = createAction('ORG_APP_COMPONENT_DETAIL__PUSH_FILE_DETAIL', (data: FileType) => ({
  data,
}))();

export const updateCloudSyncDrawerOpenStatus = createAction(
  'ORG_APP_COMPONENT_DETAIL__UPDATE_SYNC_DRAWER_OPEN_STATUS',
  (open: boolean) => ({
    open,
  }),
)();

export const fetchComponentRemotes = createAction(
  'ORG_APP_COMPONENT_DETAIL__SEARCH_COMPONENT_REMOTES',
  (params: ComponentRemotesFetchParams) => ({
    ...params,
  }),
)();

export const pushComponentRemotes = createAction(
  'ORG_APP_COMPONENT_DETAIL__PUSH_COMPONENT_REMOTES',
  (remote: ComponentRemote, lastVersion: AppComponentEditVersionType) => ({
    remote,
    lastVersion,
  }),
)();

export const saveComponentRemote = createAction(
  'ORG_APP_COMPONENT_DETAIL__SAVE_COMPONENT_REMOTES',
  (params: ComponentRemoteSaveParams) => ({
    ...params,
  }),
)();

export const updateCloudSyncDrawerLoadingStatus = createAction(
  'ORG_APP_COMPONENT_DETAIL__UPDATE_SYNC_DRAWER_Loading_STATUS',
  (open: boolean) => ({
    open,
  }),
)();
