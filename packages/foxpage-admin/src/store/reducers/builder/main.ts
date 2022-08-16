import produce from 'immer';
import _ from 'lodash';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/store/actions/builder/main';
import {
  Application,
  Content,
  File,
  FormattedData,
  Mock,
  PageContent,
  RelationDetails,
  RenderStructureNode,
  StructureNode,
  VariableEntity,
} from '@/types/index';

export type BuilderContentActionType = ActionType<typeof ACTIONS>;

const toolbarEditorData = {} as any;
const toolbarModalData = {} as any;
const application = {} as Application | null;
const content = {} as Content; // cur page content
const file = {} as File; // cur page file
const pageContent = {} as PageContent; // page content
const pageNode = null as StructureNode | null; // page node
const mock = {} as Mock; // cur page mock
const relations = {} as RelationDetails; // cur page relations
const extendContent = {} as PageContent;
const formattedData = {} as FormattedData; // formatted data(contains: formatted page content, maps)
const selectedNode = null as RenderStructureNode | null;
const localVariables: VariableEntity[] = [];
const contentState = {
  file,
  content,
  mock,
  relations,
  formattedData,
  pageContent,
  pageNode,
  extend: extendContent,
  selectedNode,
  curStep: 1,
  stepCount: 0,
  localVariables,
  editStatus: false,
};
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
  // content states
  ...contentState,
  // TODO
  templateOpenInPage: false,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: BuilderContentActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
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
        draft.file = data[0];
        break;
      }

      case getType(ACTIONS.pushLiveContent): {
        draft.extend = action.payload.data || ({} as PageContent);
        break;
      }

      case getType(ACTIONS.pushContent): {
        const _pageContent = action.payload.data || ({} as PageContent);
        const { content, mock, relations } = _pageContent;
        draft.content = _.cloneDeep(content);
        draft.mock = _.cloneDeep(mock);
        draft.relations = _.cloneDeep(relations);
        draft.pageContent = _.cloneDeep(_pageContent);
        break;
      }

      case getType(ACTIONS.pushPageNode): {
        draft.pageNode = action.payload.data;
        break;
      }

      case getType(ACTIONS.updateContent): {
        draft.pageContent = action.payload.data;
        draft.editStatus = true;
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
        draft.formattedData = _.cloneDeep(action.payload.data);
        break;
      }

      case getType(ACTIONS.selectComponent): {
        draft.selectedNode = action.payload.params;
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

      default:
        break;
    }
  });

export default reducer;
