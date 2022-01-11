import { createAction } from 'typesafe-actions';

import { ConditionItem } from '@/types/application/condition';
import {
  ComponentSourceMapType,
  ComponentStaticDeleteParams,
  ComponentStaticSaveParams,
  ComponentStructure,
  DndInfoType,
  DslType,
  PageCloneParams,
  RelationsType,
  RelationType,
} from '@/types/builder';
import { OptionsAction } from '@/types/common';

export const fetchPageRenderTree = createAction(
  'BUILDER_TEMPLATE__FETCH_RENDER_TREE',
  (applicationId: string, contentId: string, fileType?: string) => ({ applicationId, contentId, fileType }),
)();

export const pushTemplateData = createAction(
  'BUILDER_TEMPLATE__FETCH_RENDER_TREE_SUCCESS',
  (data: {
    versionType: string;
    componentList: ComponentStructure[];
    renderStructure: ComponentStructure[];
    version: DslType;
    componentSourceMap: ComponentSourceMapType;
    parsedRenderStructure: ComponentStructure[];
    parsedComponentList: ComponentStructure[];
    templates: DslType[];
  }) => ({
    data,
  }),
)();

export const setSelectedComponent = createAction('BUILDER_TEMPLATE__SET_SELECTED_COMPONENT', (id?: string) => ({
  id,
}))();

export const setComponentEditor = createAction(
  'BUILDER_TEMPLATE__SET_COMPONENT_EDITOR',
  (componentEditorOpen = false) => ({
    componentEditorOpen,
  }),
)();

export const updateVersion = createAction('BUILDER_TEMPLATE__UPDATE_VERSION', (version: DslType) => ({
  version,
}))();

export const insertComponent = createAction(
  'BUILDER_TEMPLATE__INSERT_COMPONENT',
  (applicationId: string, componentId: string, position: number, desc: ComponentStructure, parentId: string) => ({
    componentId,
    position,
    desc,
    parentId,
    applicationId,
  }),
)();

export const appendComponent = createAction(
  'BUILDER_TEMPLATE__APPEND_COMPONENT',
  (applicationId: string, componentId: string, desc: ComponentStructure) => ({
    componentId,
    desc,
    applicationId,
  }),
)();

export const saveComponent = createAction(
  'BUILDER_TEMPLATE__SAVE_COMPONENT',
  (
    applicationId: string,
    params: ComponentStaticSaveParams | ComponentStaticDeleteParams,
    deleteSelectedComponent?: boolean,
    preUpdateCb?: () => void,
  ) => ({
    applicationId,
    params,
    deleteSelectedComponent,
    preUpdateCb,
  }),
)();

export const deleteComponent = createAction(
  'BUILDER_TEMPLATE__DELETE_COMPONENT',
  (applicationId: string, componentId: string) => ({
    applicationId,
    componentId,
  }),
)();

export const copyComponent = createAction(
  'BUILDER_TEMPLATE__COPY_COMPONENT',
  (applicationId: string, componentId: string) => ({
    applicationId,
    componentId,
  }),
)();

export const updateLoadingStatus = createAction('BUILDER_TEMPLATE__UPDATE_LOADING', (value: boolean) => ({
  value,
}))();

export const publish = createAction('BUILDER_TEMPLATE__PUBLISH_TEMPLATE', (applicationId: string) => ({
  applicationId,
}))();

export const useTemplate = createAction(
  'BUILDER_TEMPLATE__EXTEND_TEMPLATE',
  (applicationId: string, successCb: () => void, contentId: string) => ({
    contentId,
    successCb,
    applicationId,
  }),
)();

export const updateEditorValue = createAction(
  'BUILDER_TEMPLATE__UPDATE_COMPONENT_EDITOR_VALUE',
  (key: string, value: unknown) => ({
    key,
    value,
  }),
)();

export const pushEditorValue = createAction(
  'BUILDER_TEMPLATE__UPDATE_COMPONENT_EDITOR_VALUE_SUCCESS',
  (key: string, value: unknown, isWrapper?: boolean) => ({
    key,
    value,
    isWrapper,
  }),
)();

export const saveComponentEditorValue = createAction(
  'BUILDER_TEMPLATE__SAVE_COMPONENT_EDITOR_VALUE',
  (applicationId: string, isWrapper: boolean, folderId: string) => ({
    applicationId,
    isWrapper,
    folderId,
  }),
)();

export const mergeComponentSourceMap = createAction(
  'BUILDER_TEMPLATE__MERGE_COMPONENT_SOURCE_MAP',
  (sourceMap: ComponentSourceMapType) => ({
    sourceMap,
  }),
)();

export const pushComponentSource = createAction('BUILDER_TEMPLATE__PUSH_COMPONENT_SOURCE', (names: string[]) => ({
  names,
}))();

export const clearAll = createAction('BUILDER_TEMPLATE__CLEAR_ALL', () => ({}))();

export const updatePreviewModalVisible = createAction(
  'BUILDER_TEMPLATE__UPDATE_PREVIEW_MODAL_VISIBLE',
  (value = false) => ({ value }),
)();

export const fetchSsrHtml = createAction('BUILDER_TEMPLATE__FETCH_SSR_HTML', (applicationId: string) => ({
  applicationId,
}))();

export const pushSsrHtml = createAction('BUILDER_TEMPLATE__FETCH_FETCH_SSR_HTML_SUCCESS', (data: string) => ({
  data,
}))();

export const updateDndInfo = createAction('BUILDER_TEMPLATE__UPDATE_DND_INFO', (value: DndInfoType) => ({
  value,
}))();

export const updatePageBasicInfo = createAction(
  'BUILDER_TEMPLATE__UPDATE_PAGE_BASIC_INFO',
  (key: string, value: string) => ({
    key,
    value,
  }),
)();

export const updatePageEditStatus = createAction('BUILDER_TEMPLATE__UPDATE_EDIT_STATUS', (value: boolean) => ({
  value,
}))();

export const saveToServer = createAction(
  'BUILDER_TEMPLATE__SAVE_TO_SERVER',
  (applicationId: string, successCb?: () => void, hideMessage = false) => ({
    applicationId,
    successCb,
    hideMessage,
  }),
)();

export const updateZoom = createAction('BUILDER_TEMPLATE__UPDATE_ZOOM', (zoom: number) => ({
  zoom,
}))();

export const updateViewModal = createAction(
  'BUILDER_TEMPLATE__UPDATE_VIEW_MODAL',
  (viewModel: 'MOBILE' | 'PC' | 'PAD') => ({
    viewModel,
  }),
)();

export const goNextStep = createAction('BUILDER_TEMPLATE__GO_NEXT_STEP', (applicationId: string) => ({
  applicationId,
}))();

export const goLastStep = createAction('BUILDER_TEMPLATE__GO_LAST_STEP', (applicationId: string) => ({
  applicationId,
}))();

export const pushLastSteps = createAction('BUILDER_TEMPLATE__PUSH_LAST_STEPS', () => ({}))();

export const popLastSteps = createAction('BUILDER_TEMPLATE__POP_LAST_STEPS', () => ({}))();

export const unShiftNextSteps = createAction('BUILDER_TEMPLATE__UNSHIFT_NEXT_STEPS', () => ({}))();

export const shiftNextSteps = createAction('BUILDER_TEMPLATE__SHIFT_NEXT_STEPS', () => ({}))();

export const clearLastSteps = createAction('BUILDER_TEMPLATE__CLEAR_NEXT_STEP', () => ({}))();

export const clearNextSteps = createAction('BUILDER_TEMPLATE__CLEAR_LAST_STEP', () => ({}))();

export const updateWrapperProps = createAction(
  'BUILDER_TEMPLATE__UPDATE_WRAPPER_PROPS',
  (key: string, value: string) => ({
    key,
    value,
  }),
)();

export const setHoveredComponent = createAction(
  'BUILDER_TEMPLATE__SET_HOVERED_COMPONENT',
  (component?: ComponentStructure) => ({
    component,
  }),
)();

export const updateContentRelation = createAction(
  'BUILDER_TEMPLATE__UPDATE_CONTENT_RELATION',
  (relation: RelationType) => ({
    relation,
  }),
)();

export const updateVersionRelations = createAction(
  'BUILDER_TEMPLATE__UPDATE_VERSION_RELATIONS',
  (relations: RelationsType) => ({
    relations,
  }),
)();

export const updateSelectedComponentUpdateStatus = createAction(
  'BUILDER_TEMPLATE__UPDATE_SELECTED_COMPONENT_UPDATE_STATUS',
  (isWrapper: boolean, status: boolean) => ({
    isWrapper,
    status,
  }),
)();

export const updateComponentCondition = createAction(
  'BUILDER_TEMPLATE__UPDATE_COMPONENT_CONDITION',
  (conditions: ConditionItem[]) => ({
    conditions,
  }),
)();

export const updateSaveLoading = createAction('BUILDER_TEMPLATE__UPDATE_SAVE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const updatePublishLoading = createAction('BUILDER_TEMPLATE__UPDATE_PUBLISH_LOADING', (loading: boolean) => ({
  loading,
}))();

export const clonePage = createAction('BUILDER_TEMPLATE__CLONE_PAGE', (params: PageCloneParams) => ({
  ...params,
}))();

export const clearResource = createAction('BUILDER_TEMPLATE__CLEAR_RESOURCE', (params: OptionsAction) => ({
  ...params,
}))();

export const clearComponentResource = createAction('BUILDER_TEMPLATE__CLEAR_COMPONENT_RESOURCE', () => ({}))();
