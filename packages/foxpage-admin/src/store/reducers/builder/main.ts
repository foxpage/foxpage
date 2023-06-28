import dayjs from 'dayjs';
import produce from 'immer';
import cloneDeep from 'lodash/cloneDeep';
import { ActionType, getType } from 'typesafe-actions';

import { FileType } from '@/constants/index';
import * as ACTIONS from '@/store/actions/builder/main';
import {
  Application,
  CheckDSLMain,
  Content,
  File,
  FormattedData,
  InitStateParams,
  LockerManagerState,
  LockerState,
  Mock,
  PageContent,
  PublishStatus,
  RelationDetails,
  RenderStructureNode,
  StructureNode,
} from '@/types/index';

export type BuilderContentActionType = ActionType<typeof ACTIONS>;

const toolbarEditorData = {} as any;
const toolbarModalData = {} as any;
const application = {} as Application | null;
const content = {} as Content; // cur page content
const file = {} as File; // cur page file
const pageContent = {} as PageContent; // page content
const pageNode = undefined as StructureNode | null | undefined; // page node
const mock = {} as Mock; // cur page mock
const relations = {} as RelationDetails; // cur page relations
const formattedData = {} as FormattedData; // formatted data(contains: formatted page content, maps)
const renderDSL = [] as RenderStructureNode[];
const selectNodeFrom = null as 'sider' | 'viewer' | null;
const selectedNode = null as RenderStructureNode | null;
const localVariables = [] as RelationDetails['variables'] | undefined;
const publishStep = -1;
const publishStatus = PublishStatus.PROCESSING;
const publishErrors = undefined as CheckDSLMain | undefined;
const showPublishModal = false as boolean;
const lockerState: LockerState = {
  locked: false,
  blocked: false,
  operationTime: dayjs(0).toISOString(),
  needUpdate: false,
};
const parseState: {
  parseKey: string;
  opt: InitStateParams | null;
  page: PageContent | null;
} = {
  parseKey: '',
  opt: null,
  page: null,
};
const lockerManagerState: LockerManagerState = {
  noticeVisible: false,
};
const contentState = {
  content,
  mock,
  relations,
  pageNode,
  extend: undefined as PageContent | undefined,
  selectedNode,
  selectNodeFrom,
  curStep: 0,
  stepCount: 0,
  localVariables,
  editStatus: false,
  lockerState,
  lockerManagerState,
  serverUpdateTime: dayjs(0).toISOString(),
  readOnly: false,
};
const rootNode = undefined as RenderStructureNode | null | undefined;

const initialState = {
  // toolbar
  toolbarEditorData,
  toolbarEditorType: '',
  toolbarEditorVisible: false,
  toolbarModalData,
  toolbarModalType: '',
  toolbarModalVisible: false,
  // loading
  loading: true,
  saveLoading: false,
  publishLoading: false,
  // main
  application,
  file,
  formattedData,
  renderDSL,
  pageContent,
  rootNode,
  // content states
  ...contentState,
  // TODO
  templateOpenInPage: false,
  lastModified: 0,
  publishStep,
  publishStatus,
  publishErrors,
  showPublishModal,
  completeFetched: 0,
  parseState,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: BuilderContentActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.updateServerContentTime): {
        draft.serverUpdateTime = action.payload.serverUpdateTime;
        break;
      }

      case getType(ACTIONS.updateLockerState): {
        draft.lockerState = { ...state.lockerState, ...(action.payload as { data: LockerState }).data };
        break;
      }

      case getType(ACTIONS.setLockerManagerState): {
        draft.lockerManagerState = { ...state.lockerManagerState, ...action.payload.data };
        break;
      }

      case getType(ACTIONS.resetLockerManager): {
        draft.lockerManagerState = { ...lockerManagerState };
        break;
      }

      case getType(ACTIONS.resetLockerState): {
        draft.lockerState = { ...lockerState };
        break;
      }

      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }

      case getType(ACTIONS.clearByContentChange): {
        Object.assign(draft, { ...contentState });
        break;
      }

      case getType(ACTIONS.updateLoading): {
        draft.loading = action.payload.loading;
        break;
      }

      case getType(ACTIONS.updatePublishing): {
        draft.publishLoading = action.payload.loading;
        break;
      }

      case getType(ACTIONS.updateSaveLoading): {
        draft.saveLoading = action.payload.loading;
        break;
      }

      case getType(ACTIONS.pushApp): {
        draft.application = action.payload.data || null;
        break;
      }

      case getType(ACTIONS.pushFile): {
        const { data = [] } = action.payload;
        draft.file = data[0] || {};
        break;
      }

      case getType(ACTIONS.pushLiveContent): {
        draft.extend = action.payload.data || ({} as PageContent);
        break;
      }

      case getType(ACTIONS.pushContent): {
        const _pageContent = action.payload.data || ({} as PageContent);
        const { content, mock, relations } = _pageContent;
        draft.content = cloneDeep(content);
        draft.mock = cloneDeep(mock);
        draft.relations = cloneDeep(relations);
        draft.pageContent = cloneDeep(_pageContent);

        // update select node
        if (draft.selectedNode) {
          draft.selectedNode.__lastModified = new Date().getTime();
        }
        break;
      }

      case getType(ACTIONS.addRelations): {
        const old = cloneDeep(draft.relations);
        const newData = action.payload.data;
        draft.relations = {
          ...old,
          variables: (old.variables || []).concat(newData.variables || []),
          conditions: (old.conditions || []).concat(newData.conditions || []),
          functions: (old.functions || []).concat(newData.functions || []),
          blocks: (old.blocks || []).concat(newData.blocks || []),
        };
        break;
      }

      case getType(ACTIONS.pushContentOnly): {
        const { content, updateTime } = action.payload.data || ({} as PageContent);
        draft.content = cloneDeep(content);
        draft.serverUpdateTime = updateTime!;
        break;
      }

      case getType(ACTIONS.pushPageNode): {
        draft.pageNode = action.payload.data;
        break;
      }

      case getType(ACTIONS.updateContent): {
        draft.pageContent = action.payload.data;
        draft.editStatus = true;
        // update select node
        if (!action.payload.notUpdateSelectNodeLastModified && draft.selectedNode) {
          draft.selectedNode.__lastModified = new Date().getTime();
        }
        break;
      }

      case getType(ACTIONS.updateMock): {
        draft.mock = action.payload.mock;
        break;
      }

      case getType(ACTIONS.updateEditState): {
        draft.editStatus = action.payload.state;
        break;
      }

      case getType(ACTIONS.pushFormatData): {
        draft.formattedData = cloneDeep(action.payload.data);
        break;
      }

      case getType(ACTIONS.pushRenderDSL): {
        draft.renderDSL = cloneDeep(action.payload.data);
        // rootNode init
        const isPage = draft.file?.type === FileType.page;
        const pageNode = draft.pageNode;
        if (pageNode === undefined || pageNode === null) {
          draft.rootNode = null;
        } else {
          draft.rootNode = {
            ...pageNode,
            childIds: (pageNode.children || []).map((item) => item.id),
            __editorConfig: {
              templateBind: isPage,
              disableTemplateBind: isPage && !!pageNode.extension?.extendId,
            },
          } as unknown as RenderStructureNode;
        }
        break;
      }

      case getType(ACTIONS.selectComponent): {
        draft.selectedNode = action.payload.node;
        draft.selectNodeFrom = action.payload.opt.from;
        break;
      }

      case getType(ACTIONS.setCurStep): {
        draft.curStep = action.payload.step;
        break;
      }

      case getType(ACTIONS.setSteps): {
        draft.stepCount = action.payload.step;
        break;
      }

      case getType(ACTIONS.pushLocalVariables): {
        draft.localVariables = action.payload.variables;
        break;
      }

      case getType(ACTIONS.updateToolbarEditorVisible): {
        draft.toolbarEditorData = action.payload.data || {};
        draft.toolbarEditorType = action.payload.type || '';
        draft.toolbarEditorVisible = action.payload.open;
        break;
      }

      case getType(ACTIONS.configReadOnly): {
        draft.readOnly = action.payload.value || false;
        break;
      }

      case getType(ACTIONS.updateToolbarModalVisible): {
        draft.toolbarModalData = action.payload.data || {};
        draft.toolbarModalType = action.payload.type || '';
        draft.toolbarModalVisible = action.payload.open;
        break;
      }

      case getType(ACTIONS.templateOpenInPage): {
        draft.templateOpenInPage = action.payload.status;
        break;
      }

      case getType(ACTIONS.updateLastModified): {
        draft.lastModified = new Date().getTime();
        break;
      }

      case getType(ACTIONS.pushPublishStep): {
        draft.publishStep = action.payload.current;
        break;
      }

      case getType(ACTIONS.pushPublishStatus): {
        draft.publishStatus = action.payload.status;
        break;
      }

      case getType(ACTIONS.pushPublishErrors): {
        draft.publishErrors = action.payload.errors;
        break;
      }

      case getType(ACTIONS.updateShowPublishModal): {
        draft.showPublishModal = action.payload.show;
        break;
      }

      case getType(ACTIONS.resetPublishStatus): {
        draft.publishLoading = false;
        draft.publishStep = -1;
        draft.publishStatus = PublishStatus.PROCESSING;
        draft.publishErrors = undefined;
        break;
      }

      case getType(ACTIONS.completeFetched): {
        draft.completeFetched = new Date().getTime();
        break;
      }

      case getType(ACTIONS.updateParseParams): {
        draft.parseState = {
          parseKey: action.payload.parseKey,
          opt: action.payload.data.opt,
          page: action.payload.data.page,
        };
        break;
      }

      default:
        break;
    }
  });

export default reducer;
