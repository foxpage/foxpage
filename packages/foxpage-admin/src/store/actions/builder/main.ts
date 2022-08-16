import { createAction } from 'typesafe-actions';

import {
  Application,
  ContentFetchedRes,
  ContentFetchParams,
  FilesFetchedResponse,
  FilesFetchParams,
  FormattedData,
  Mock,
  PageContent,
  RenderStructureNode,
  StructureNode,
  VariableEntity,
} from '@/types/index';

export const updateToolbarEditorVisible = createAction(
  'BUILDER_MAIN__UPDATE_TOOLBAR_EDITOR_VISIBLE',
  (open: boolean, type?: string, data?: any) => ({ open, type, data }),
)();

export const updateToolbarModalVisible = createAction(
  'BUILDER_MAIN__UPDATE_TOOLBAR_MODAL_VISIBLE',
  (open: boolean, type?: string, data?: any) => ({ open, type, data }),
)();

export const clearAll = createAction('BUILDER_MAIN__CLEAR_ALL', () => ({}))();

export const clearByContentChange = createAction('BUILDER_MAIN__CLEAR_BY_CONTENT_CHANGE', () => ({}))();

export const updateLoading = createAction('BUILDER_MAIN__UPDATE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const updateSaveLoading = createAction('BUILDER_MAIN__UPDATE_SAVE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const updatePublishing = createAction('BUILDER_MAIN__UPDATE_PUBLISH_LOADING', (loading: boolean) => ({
  loading,
}))();

export const updateEditState = createAction('BUILDER_MAIN__UPDATE_EDIT_STATUS', (state: boolean) => ({
  state,
}))();

export const fetchApp = createAction('BUILDER_MAIN__FETCH_APP', (id: string) => ({
  id,
}))();

export const pushApp = createAction('BUILDER_MAIN__PUSH_APP', (data?: Application) => ({
  data,
}))();

export const fetchContent = createAction('BUILDER_MAIN__FETCH_CONTENT', (params: ContentFetchParams) => ({
  ...params,
}))();

export const pushContent = createAction('BUILDER_MAIN__PUSH_CONTENT', (data: ContentFetchedRes['data']) => ({
  data,
}))();

export const updateContent = createAction('BUILDER_PAGE__UPDATE_CONTENT', (data: PageContent) => ({
  data,
}))();

export const updateMock = createAction('BUILDER_PAGE__UPDATE_MOCK', (mock: Mock) => ({
  mock,
}))();

export const updatePageNode = createAction('BUILDER_PAGE__UPDATE_PAGE_NODE', (data: StructureNode) => ({
  data,
}))();

export const pushPageNode = createAction('BUILDER_PAGE__PUSH_PAGE_NODE', (data: StructureNode | null) => ({
  data,
}))();

export const saveContent = createAction('BUILDER_PAGE__SAVE_PAGE', () => ({}))();

export const cloneContent = createAction('BUILDER_PAGE__CLONE_PAGE', (contentId: string) => ({
  contentId,
}))();

export const publishContent = createAction('BUILDER_PAGE__PUBLISH_PAGE', () => ({}))();

export const pushFormatData = createAction('BUILDER_MAIN__PUSH_FORMAT_DATA', (data: FormattedData) => ({
  data,
}))();

export const fetchLiveContent = createAction(
  'BUILDER_MAIN__FETCH_LIVE_CONTENT',
  (params: ContentFetchParams) => ({
    params,
  }),
)();

export const pushLiveContent = createAction(
  'BUILDER_MAIN__PUSH_LIVE_CONTENT',
  (data: ContentFetchedRes['data']) => ({
    data,
  }),
)();

export const fetchFile = createAction('BUILDER_MAIN__FETCH_FILE', (params: FilesFetchParams) => ({
  ...params,
}))();

export const pushFile = createAction('BUILDER_MAIN__PUSH_FILE', (data: FilesFetchedResponse['data']) => ({
  data,
}))();

export const selectComponent = createAction(
  'BUILDER_MAIN__SELECT_COMPONENT',
  (params: RenderStructureNode | null) => ({
    params,
  }),
)();

// steps
export const setCurStep = createAction('BUILDER_MAIN__SET_STEP', (step: number) => ({ step }))();

export const getSteps = createAction('BUILDER_MAIN__GET_STEPS', () => ({}))();

export const setSteps = createAction('BUILDER_MAIN__SET_STEPS', (step: number) => ({ step }))();

export const preStep = createAction('BUILDER_MAIN__PRE_STEP', () => ({}))();

export const nextStep = createAction('BUILDER_MAIN__NEXT_STEP', () => ({}))();

export const goStep = createAction('BUILDER_MAIN__DO_STEP', (params: PageContent) => ({ params }))();

export const pushStep = createAction('BUILDER_MAIN__PUSH_STEP', (params: PageContent) => ({ params }))();

// validator
export const validate = createAction('BUILDER_MAIN__VALIDATE', () => ({}))();

export const pushLocalVariables = createAction(
  'BUILDER_MAIN__PUSH_LOCAL_VARIABLES',
  (variables: VariableEntity[]) => ({ variables }),
)();

// TODO:
export const templateOpenInPage = createAction('BUILDER_MAIN__TEMPLATE_OPEN_IN_PAGE', (status: boolean) => ({
  status,
}))();
