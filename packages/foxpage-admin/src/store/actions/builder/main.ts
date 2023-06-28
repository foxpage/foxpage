import isNil from 'lodash/isNil';
import { createAction } from 'typesafe-actions';

import {
  Application,
  BuilderWindowChangeOptions,
  CheckDSLMain,
  ContentFetchedRes,
  ContentFetchParams,
  ContentSavedRes,
  FilesFetchedResponse,
  FilesFetchParams,
  FormattedData,
  InitStateParams,
  LockerManagerState,
  LockerState,
  Mock,
  PageContent,
  PublishStatus,
  PublishSteps,
  RelationDetails,
  RenderStructureNode,
  StructureNode,
} from '@/types/index';

export const configReadOnly = createAction('BUILDER_MAIN__CONFIG_READONLY', (value: boolean) => ({
  value,
}))();

export const updateToolbarEditorVisible = createAction(
  'BUILDER_MAIN__UPDATE_TOOLBAR_EDITOR_VISIBLE',
  (open: boolean, type?: string, data?: any) => ({ open, type, data }),
)();

export const updateToolbarModalVisible = createAction(
  'BUILDER_MAIN__UPDATE_TOOLBAR_MODAL_VISIBLE',
  (open: boolean, type?: string, data?: any) => ({ open, type, data }),
)();

export const clearAll = createAction('BUILDER_MAIN__CLEAR_ALL', () => ({}))();

export const clearByContentChange = createAction(
  'BUILDER_MAIN__CLEAR_BY_CONTENT_CHANGE',
  (contentId: string, ignoreStepCache?: boolean) => ({ contentId, ignoreStepCache }),
)();

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

export const loadToken = createAction('BUILDER_MAIN__LOAD_TOKEN', () => ({}))();

export const pushContent = createAction('BUILDER_MAIN__PUSH_CONTENT', (data: ContentFetchedRes['data']) => ({
  data,
}))();

export const addRelations = createAction('BUILDER_MAIN__ADD_RELATIONS', (data: RelationDetails) => ({
  data,
}))();

export const pushContentOnly = createAction(
  'BUILDER_MAIN__PUSH_CONTENT_ONLY',
  (data: ContentSavedRes['data']) => ({ data }),
)();

export const updateContent = createAction(
  'BUILDER_PAGE__UPDATE_CONTENT',
  (data: PageContent, notUpdateSelectNodeLastModified?: boolean) => ({
    data,
    notUpdateSelectNodeLastModified,
  }),
)();

export const updateMock = createAction('BUILDER_PAGE__UPDATE_MOCK', (mock: Mock) => ({
  mock,
}))();

export const updatePageNode = createAction('BUILDER_PAGE__UPDATE_PAGE_NODE', (data: StructureNode) => ({
  data,
}))();

export const pushPageNode = createAction('BUILDER_PAGE__PUSH_PAGE_NODE', (data: StructureNode | null) => ({
  data,
}))();

export const saveContent = createAction(
  'BUILDER_PAGE__SAVE_PAGE',
  (data?: { delay?: boolean; publish?: boolean; autoSave?: boolean; force?: boolean }) => ({
    data,
  }),
)();

export const cloneContent = createAction('BUILDER_PAGE__CLONE_PAGE', (contentId: string) => ({
  contentId,
}))();

export const publishContent = createAction('BUILDER_PAGE__PUBLISH_PAGE', (saved?: boolean) => ({ saved }))();

export const pushFormatData = createAction('BUILDER_MAIN__PUSH_FORMAT_DATA', (data: FormattedData) => ({
  data,
}))();

export const pushRenderDSL = createAction(
  'BUILDER_MAIN__PUSH_RENDER_DSL',
  (data: FormattedData['formattedSchemas']) => ({
    data,
  }),
)();

export const updateParseParams = createAction(
  'BUILDER_MAIN__UPDATE_PARSE_PARAMS',
  (parseKey: string, data: { page: PageContent; opt: InitStateParams }) => ({
    parseKey,
    data,
  }),
)();

export const completeFetched = createAction('BUILDER_MAIN__COMPLETE_FETCHED', () => ({}))();

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
  (node: RenderStructureNode | null, opt: { from: 'sider' | 'viewer' | null }) => ({
    node,
    opt,
  }),
)();

export const updateContentScreenshot = createAction(
  'BUILDER_MAIN__UPDATE_CONTENT_SCREENSHOT',
  (data: { img: string; versionId?: string }) => data,
)();

// steps
export const setCurStep = createAction('BUILDER_MAIN__SET_STEP', (step: number) => ({ step }))();

export const getSteps = createAction('BUILDER_MAIN__GET_STEPS', () => ({}))();

export const setSteps = createAction('BUILDER_MAIN__SET_STEPS', (step: number) => ({ step }))();

export const preStep = createAction('BUILDER_MAIN__PRE_STEP', () => ({}))();

export const nextStep = createAction('BUILDER_MAIN__NEXT_STEP', () => ({}))();

export const goStep = createAction('BUILDER_MAIN__DO_STEP', (params: PageContent) => ({ params }))();

export const pushStep = createAction(
  'BUILDER_MAIN__PUSH_STEP',
  (params: PageContent, curStep: number, oldContent?: PageContent) => ({ params, curStep, oldContent }),
)();

// validator
export const validate = createAction('BUILDER_MAIN__VALIDATE', () => ({}))();

export const pushLocalVariables = createAction(
  'BUILDER_MAIN__PUSH_LOCAL_VARIABLES',
  (variables: RelationDetails['variables']) => ({ variables }),
)();

// TODO:
export const templateOpenInPage = createAction('BUILDER_MAIN__TEMPLATE_OPEN_IN_PAGE', (status: boolean) => ({
  status,
}))();

// component mock delete
export const deleteComponentMock = createAction(
  'BUILDER_MAIN__DELETE_COMPONENT_MOCK',
  (data: BuilderWindowChangeOptions) => ({
    data,
  }),
)();

export const updateLastModified = createAction('BUILDER_MAIN__UPDATE_LAST_MODIFIED', () => ({}))();

export const pushPublishStep = createAction('BUILDER_MAIN__PUSH_PUBLISH_STEP', (current: PublishSteps) => ({
  current,
}))();

export const checkDSLBeforePublish = createAction('BUILDER_MAIN__CHECK_DSL_BEFORE_PUBLISH', () => ({}))();

export const pushPublishStatus = createAction(
  'BUILDER_MAIN__PUSH_PUBLISH_STATUS',
  (status: PublishStatus) => ({
    status,
  }),
)();

export const pushPublishErrors = createAction(
  'BUILDER_MAIN__PUSH_PUBLISH_ERRORS',
  (errors?: CheckDSLMain) => ({
    errors,
  }),
)();

export const updateShowPublishModal = createAction(
  'BUILDER_MAIN__UPDATE_SHOW_PUBLISH_MODAL',
  (show: boolean) => ({
    show,
  }),
)();

export const resetPublishStatus = createAction('BUILDER_MAIN__RESET_PUBLISH_STATUS', () => ({}))();

export const updatePublishVersionId = createAction(
  'BUILDER_MAIN__UPDATE_PUBLISH_VERSION_ID',
  (id: string) => ({
    id,
  }),
)();
// block multi-user editing
// Begin
export const updateLockerState = createAction(
  'BUILDER_MAIN__UPDATE_LOCKER_STATE',
  (data: Partial<LockerState>) => ({
    data,
  }),
)();
export const resetLockerState = createAction('BUILDER_MAIN__UPDATE_LOCKER_STATE', () => ({}))();
export const handleHeartBeatCheck = createAction('BUILDER_MAIN__HANDLE_HEART_BEAT_CHECK_START', (flag) => ({
  flag: isNil(flag) ? true : flag,
}))();
export const lockContent = createAction('BUILDER_MAIN__HANDLE_CONTENT_LOCK', (forceLock?: boolean) => ({
  forceLock: !!forceLock,
}))();

export const unlockContent = createAction('BUILDER_MAIN__HANDLE_CONTENT_UNLOCK', () => ({}))();

export const setLockerManagerState = createAction(
  'BUILDER_MAIN__SET_LOCKER_MANAGER_STATE',
  (data: Partial<LockerManagerState>) => ({ data }),
)();

export const handleLockerManager = createAction(
  'BUILDER_MAIN__HANDLE_LOCKER_MANAGER_START',
  (flag?: boolean) => {
    return { flag: isNil(flag) ? true : flag };
  },
)();
export const resetLockerManager = createAction('BUILDER_MAIN__HANDLE_LOCKER_MANAGER_RESET', () => ({}))();
export const guard = createAction('BUILDER_MAIN__GUARD', (future) => ({ future }))();
export const updateServerContentTime = createAction(
  'BUILDER_MAIN__UPDATE_CONTENT_TIME_SERVER',
  (serverUpdateTime) => ({ serverUpdateTime }),
)();
// End

export const prasePageInServer = createAction(
  'BUILDER_MAIN__PARSE_PAGE_IN_SERVER',
  (page: PageContent, opt: InitStateParams) => ({
    page,
    opt,
  }),
)();
