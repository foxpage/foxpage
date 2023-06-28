import { createAction } from 'typesafe-actions';

import {
  FileScope,
  GoodsCommitParams,
  PaginationInfo,
  RelationDetails,
  VariableBindParams,
  VariableDeleteParams,
  VariableEntity,
  VariablePublishParams,
  VariableSaveParams,
  VariablesFetchParams,
} from '@/types/index';

export const clearAll = createAction('APPLICATION_FILE_VARIABLES__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction(
  'APPLICATION_FILE_VARIABLES__UPDATE_LOADING',
  (loading: boolean) => ({ loading }),
)();

export const updatePaginationInfo = createAction(
  'APPLICATION_FILE_VARIABLES__UPDATE_PAGINATION_INFO',
  (pageInfo: PaginationInfo) => ({
    pageInfo,
  }),
)();

export const setVariableBindModalVisibleStatus = createAction(
  'APPLICATION_FILE_VARIABLES__VARIABLES_SET_VARIABLE_USE_MODAL_VISIBLE_STATUS',
  (params: VariableBindParams) => ({
    ...params,
  }),
)();

export const fetchList = createAction(
  'APPLICATION_FILE_VARIABLES__FETCH_LIST',
  (params: VariablesFetchParams) => ({
    params,
  }),
)();

export const pushList = createAction(
  'APPLICATION_FILE_VARIABLES__PUSH_LIST',
  (list: VariableEntity[], pageInfo: PaginationInfo) => ({ list, pageInfo }),
)();

export const fetchVariableBuilderVersion = createAction(
  'APPLICATION_FILE_VARIABLES__GET_VARIABLE_BUILD_VERSION',
  (applicationId: string, file: VariableEntity) => ({
    applicationId,
    file,
  }),
)();

export const deleteVariable = createAction(
  'APPLICATION_FILE_VARIABLES__DELETE_VARIABLE',
  (params: VariableDeleteParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const updateVariableContent = createAction(
  'APPLICATION_FILE_VARIABLES__UPDATE_VARIABLE_CONTENT',
  (fileId: string, folderId?: string) => ({
    fileId,
    folderId,
  }),
)();

export const openEditDrawer = createAction(
  'APPLICATION_FILE_VARIABLES__OPEN_EDIT_DRAWER',
  (open: boolean, variable?: VariableEntity, type?: string) => ({ open, variable, type }),
)();

export const updateEditVariableValue = createAction(
  'APPLICATION_FILE_VARIABLES__UPDATE_EDIT_VARIABLE_VALUE',
  (key: string, value: unknown) => ({ key, value }),
)();

export const updateVariableContentRelation = createAction(
  'APPLICATION_FILE_VARIABLES__UPDATE_VARIABLE_CONTENT_RELATION',
  (key: string, value: unknown) => ({ key, value }),
)();

export const updateVariableRelations = createAction(
  'APPLICATION_FILE_VARIABLES__UPDATE_VARIABLE_RELATIONS',
  (relations: RelationDetails) => ({ relations }),
)();

export const updateScope = createAction('APPLICATION_FILE_VARIABLES__UPDATE_SCOPE', (scope: FileScope) => ({
  scope,
}))();

export const updateVariableContentValue = createAction(
  'APPLICATION_FILE_VARIABLES__UPDATE_VARIABLE_CONTENT_VALUE',
  (key: string, value: unknown) => ({ key, value }),
)();

export const updateVariableContentProps = createAction(
  'APPLICATION_FILE_VARIABLES__UPDATE_VARIABLE_CONTENT_PROPS',
  (key: string, value: unknown) => ({ key, value }),
)();

export const pushVariableBuilderVersion = createAction(
  'APPLICATION_FILE_VARIABLES__PUSH_VARIABLE_BUILD_VERSION',
  (data: VariableEntity) => ({
    data,
  }),
)();

export const saveVariable = createAction(
  'APPLICATION_FILE_VARIABLES__SAVE_VARIABLE',
  (params: VariableSaveParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

//publish
export const publishVariable = createAction(
  'APPLICATION_FILE_VARIABLES__PUBLISH_VARIABLE',
  (params: VariablePublishParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

// commit to store
export const commitToStore = createAction(
  'APPLICATION_FILE_VARIABLES__COMMIT_TO_STORE',
  (params: GoodsCommitParams, cb?: () => void) => ({ params, cb }),
)();
