import { createAction } from 'typesafe-actions';

import {
  CopyOptions,
  DndData,
  PageContent,
  PasteOptions,
  RenderStructureNode,
  UpdateOptions,
} from '@/types/index';

export const clearAll = createAction('BUILDER_EVENT__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction('BUILDER_EVENT__UPDATE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const forReRender = createAction(
  'BUILDER_EVENT__FPR_RERENDER',
  (pageContent: PageContent, oldPageContent?: PageContent) => ({
    pageContent,
    oldPageContent,
  }),
)();

export const updateComponent = createAction(
  'BUILDER_EVENT__UPDATE_COMPONENT',
  (params: RenderStructureNode, opt?: UpdateOptions) => ({
    params,
    opt,
  }),
)();

export const removeComponent = createAction(
  'BUILDER_EVENT__REMOVE_COMPONENT',
  (params: RenderStructureNode, opt?: UpdateOptions) => ({
    params,
    opt,
  }),
)();

export const copyComponent = createAction(
  'BUILDER_EVENT__COPY_COMPONENT',
  (params: RenderStructureNode, opt?: UpdateOptions) => ({
    params,
    opt,
  }),
)();

export const dropComponent = createAction('BUILDER_EVENT__DROP_COMPONENT', (params: DndData) => ({
  params,
}))();

export const copyToClipboard = createAction(
  'BUILDER_EVENT__COPY_TO_CLIPBOARD',
  (node: RenderStructureNode, opt: CopyOptions) => ({
    node,
    opt,
  }),
)();

export const pasteFromClipboard = createAction(
  'BUILDER_EVENT__PASTE_FROM_CLIPBOARD',
  (node: RenderStructureNode, opt: PasteOptions) => ({
    node,
    opt,
  }),
)();

export const variableBind = createAction(
  'BUILDER_EVENT__VARIABLE_BIND',
  (keys: string, value?: string, opt?: { isMock: boolean }) => ({
    keys,
    value,
    opt,
  }),
)();

export const conditionBind = createAction('BUILDER_EVENT__CONDITION_BIND', (conditionIds: string[]) => ({
  conditionIds,
}))();
