import { createAction } from 'typesafe-actions';

import VariableType, { VariableDeleteParams, VariableSaveParams } from '@/types/application/variable';
import { VariableBindParams } from '@/types/builder/editor';
import { RelationsType } from '@/types/builder/structure.d';
import { PaginationInfo } from '@/types/common';

export const getVariables = createAction('BUILDER__GET_VARIABLES', (folderId?: string) => ({
  folderId,
}))();

export const getApplicationVariables = createAction(
  'BUILDER__GET_APPLICATION_VARIABLES',
  (applicationId: string, pageInfo?: PaginationInfo) => ({
    applicationId,
    pageInfo,
  }),
)();

export const pushVariables = createAction(
  'BUILDER__GET_VARIABLES_SUCCESS',
  (data: VariableType[], pageInfo: PaginationInfo) => ({ data, pageInfo }),
)();

export const deleteVariable = createAction('BUILDER__DELETE_VARIABLES', (params: VariableDeleteParams) => ({
  ...params,
}))();

export const updateVariableContent = createAction('BUILDER__DELETE_VARIABLES', (fileId: string, folderId?: string) => ({
  fileId,
  folderId,
}))();

export const updateVariableEditDrawerOpen = createAction(
  'BUILDER__UPDATE_VARIABLE_EDIT_DRAWER_OPEN',
  (open = false) => ({ open }),
)();

export const updateEditVariableValue = createAction(
  'BUILDER__UPDATE_EDIT_VARIABLE_VALUE',
  (key: string, value: unknown) => ({ key, value }),
)();

export const updateVariableContentRelation = createAction(
  'BUILDER__UPDATE_EDIT_VARIABLE_CONTENT_RELATION',
  (key: string, value: unknown) => ({ key, value }),
)();

export const updateVariableRelations = createAction(
  'BUILDER__UPDATE_EDIT_VARIABLE_RELATIONS',
  (relations: RelationsType) => ({ relations }),
)();

export const updateVariableContentValue = createAction(
  'BUILDER__UPDATE_EDIT_VARIABLE_CONTENT_VALUE',
  (key: string, value: unknown) => ({ key, value }),
)();

export const updateVariableContentProps = createAction(
  'BUILDER__UPDATE_EDIT_VARIABLE_CONTENT_PROPS',
  (key: string, value: unknown) => ({ key, value }),
)();

export const setLoadingStatus = createAction('BUILDER__SET_LOADING', (loading = false) => ({ loading }))();

export const getVariableBuilderVersion = createAction(
  'BUILDER__GET_VARIABLE_BUILD_VERSION',
  (file: VariableType, applicationId: string) => ({
    file,
    applicationId,
  }),
)();

export const pushVariableBuilderVersion = createAction('GET_VARIABLE_BUILD_VERSION_SUCCESS', (data: VariableType) => ({
  data,
}))();

export const saveVariable = createAction('BUILDER__SAVE_VARIABLES', (params: VariableSaveParams) => ({
  ...params,
}))();

export const setVariableBindModalVisibleStatus = createAction(
  'BUILDER__VARIABLES_SET_VARIABLE_USE_MODAL_VISIBLE_STATUS',
  (params: VariableBindParams) => ({
    ...params,
  }),
)();

export const clearAll = createAction('BUILDER__VARIABLE_CLEAR_ALL', () => ({}))();
