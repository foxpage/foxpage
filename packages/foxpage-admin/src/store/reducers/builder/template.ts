import produce from 'immer';
import _ from 'lodash';
import { ActionType, getType } from 'typesafe-actions';

import * as listACTIONS from '@/actions/builder/component-list';
import * as ACTIONS from '@/actions/builder/template';
import {
  ComponentSourceMapType,
  ComponentStructure,
  DndInfoType,
  DslType,
  ExtensionData,
  MockContent,
  RelationsType,
  Template,
} from '@/types/builder';
import shortId from '@/utils/short-id';

export type TemplateActionType = ActionType<typeof ACTIONS | typeof listACTIONS>;
type initialDataType = typeof initialState;
type StructureRecord = Record<string, ComponentStructure>;

const allRelations: RelationsType = {};
const componentList: ComponentStructure[] = [];
const relations: DslType[] = [];
const dslList: DslType[] = [];
const templates: Template[] = [];
const version: DslType = {
  id: '',
  contentId: '',
  components: [],
  content: { id: '', schemas: [], relation: {} },
  relations: allRelations,
  mock: {} as MockContent,
};
const initComponent: ComponentStructure = {
  id: '',
  label: '',
  name: '',
  props: {},
  mock: {},
} as ComponentStructure;
const dndInfo: DndInfoType = {} as DndInfoType;
const componentEditorValue = { directive: { tpl: undefined } };
const componentSourceMap: ComponentSourceMapType = {} as ComponentSourceMapType;
// extend data: for record the base content & current content
const extensionData = {} as ExtensionData;
//mock
const mocks: MockContent[] = [];
const mockVersion: DslType = {
  id: '',
  contentId: '',
  components: [],
  content: { id: '', schemas: [], relation: {} },
  relations: allRelations,
  mock: {} as MockContent,
};
const mockComponentList: ComponentStructure[] = [];

const initialState = {
  version,
  componentSourceMap,
  versionType: '',
  componentList,
  parsedComponentList: componentList,
  renderStructure: componentList,
  parsedRenderStructure: componentList,
  dndInfo: dndInfo,
  relations,
  versionChange: Symbol('change'),
  selectedComponentId: '',
  componentEditorValue,
  selectedComponent: initComponent,
  selectedWrapperComponent: initComponent,
  loading: false,
  editStatus: false,
  lastStepStatus: false,
  nextStepStatus: false,
  previewModalVisible: false,
  viewModel: 'PC',
  templates,
  zoom: 1,
  lastSteps: dslList,
  nextSteps: dslList,
  saveLoading: false,
  publishLoading: false,
  extensionData,
  mocks,
  mockVersion,
  mockComponentList,
  mockParsedComponentList: mockComponentList,
  mockParsedRenderStructure: mockComponentList,
};

/**
 * tree to record by id
 * @param schemas
 */
function treeToRecord(schemas: ComponentStructure[], record: StructureRecord) {
  schemas.forEach((item) => {
    record[item.id] = item;
    if (item.children?.length > 0) {
      treeToRecord(item.children, record);
    }
  });
}

const templateReducer = (state: initialDataType = initialState, action: TemplateActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.pushTemplateData): {
        const {
          versionType,
          componentList,
          renderStructure,
          version,
          componentSourceMap,
          parsedRenderStructure,
          parsedComponentList,
          templates,
          mockVersion,
          mockComponentList,
          mockParsedComponentList,
          mockParsedRenderStructure,
        } = action.payload.data;
        const oldComponentSourceMap = state.componentSourceMap;
        const oldVersionType: string = state.versionType;

        draft.componentList = componentList || [];
        draft.versionType = versionType || oldVersionType;
        draft.renderStructure = renderStructure || [];
        draft.version = version;
        draft.parsedRenderStructure = parsedRenderStructure || [];
        draft.parsedComponentList = parsedComponentList || [];
        draft.relations = templates;
        draft.versionChange = Symbol('change');
        if (componentSourceMap) {
          draft.componentSourceMap = { ...oldComponentSourceMap, ...componentSourceMap };
        }
        // mock
        if (mockVersion) draft.mockVersion = mockVersion;
        if (mockComponentList) draft.mockComponentList = mockComponentList;
        if (mockParsedComponentList) draft.mockParsedComponentList = mockParsedComponentList;
        if (mockParsedRenderStructure) draft.mockParsedRenderStructure = mockParsedRenderStructure;
        break;
      }

      case getType(ACTIONS.pushExtensionData): {
        const { baseContent, curContent } = action.payload || {};
        const baseStructureRecord: StructureRecord = {};
        const curStructureRecord: StructureRecord = {};
        treeToRecord(baseContent?.content?.schemas || [], baseStructureRecord);
        treeToRecord(curContent?.content?.schemas || [], curStructureRecord);
        draft.extensionData = { baseContent, curContent, baseStructureRecord, curStructureRecord };
        break;
      }

      case getType(ACTIONS.updateContentRelation): {
        const { relation, type = '' } = action.payload;
        const newVersion = _.cloneDeep(state.version);
        newVersion.content.relation = Object.assign({}, newVersion.content.relation, relation);
        draft.version = newVersion;

        if (type === 'mock') {
          const newMockVersion = _.cloneDeep(state.mockVersion);
          newMockVersion.content.relation = relation;
          draft.mockVersion = newMockVersion;
        }
        break;
      }

      case getType(ACTIONS.updateVersionRelations): {
        const { relations, type = '' } = action.payload;
        const { variables = [], functions = [], conditions = [] } = relations;
        const version = type === 'mock' ? state.mockVersion : state.version;
        const newVersion = _.cloneDeep(version);
        const { variables: oldVariables = [], functions: oldFunctions = [], conditions: oldConditions = [] } =
          newVersion?.relations || {};

        variables.forEach((variable) => {
          const index = oldVariables.findIndex((item) => item.id === variable.id);
          if (index < 0) {
            oldVariables.push(variable);
          } else {
            oldVariables.splice(index, 1, variable);
          }
        });

        functions.forEach((func) => {
          const index = oldFunctions.findIndex((item) => item.id === func.id);
          if (index < 0) {
            oldFunctions.push(func);
          } else {
            oldFunctions.splice(index, 1, func);
          }
        });

        conditions.forEach((condition) => {
          const index = oldConditions.findIndex((item) => item.id === condition.id);
          if (index < 0) {
            oldConditions.push(condition);
          } else {
            oldConditions.splice(index, 1, condition);
          }
        });
        if (!newVersion.relations) {
          newVersion.relations = {};
        }
        newVersion.relations.variables = oldVariables;
        newVersion.relations.functions = oldFunctions;
        newVersion.relations.conditions = oldConditions;

        if (type === 'mock') {
          draft.mockVersion = newVersion;
        } else {
          draft.version = newVersion;
        }
        break;
      }

      case getType(listACTIONS.pushComponentList): {
        const { data } = action.payload;
        const oldComponentSourceMap = state.componentSourceMap;
        const newMap: ComponentSourceMapType = {} as ComponentSourceMapType;
        data.forEach((component) => {
          if (component.name) {
            newMap[component.name] = component;
            newMap[`${component.name}@${component.version}`] = component;
          }
          const components = component?.components || [];
          if (components.length > 0) {
            component.components?.forEach((item) => {
              if (item.name) {
                newMap[item.name] = item;
                newMap[`${item.name}@${item.version}`] = item;
              }
            });
          }
        });
        draft.componentSourceMap = {
          ...oldComponentSourceMap,
          ...newMap,
        };
        break;
      }

      case getType(ACTIONS.mergeComponentSourceMap): {
        const { sourceMap } = action.payload;
        const oldComponentSourceMap = state.componentSourceMap;
        draft.componentSourceMap = {
          ...oldComponentSourceMap,
          ...sourceMap,
        };
        break;
      }

      case getType(ACTIONS.updateVersion): {
        const { version } = action.payload;
        draft.version = version;
        break;
      }

      case getType(ACTIONS.setSelectedComponent): {
        const { id } = action.payload;
        const { componentList = [], parsedComponentList = [], mocks } = state;
        const selectedComponent = _.cloneDeep(
          componentList.find((item) => item.id === id) || parsedComponentList.find((item) => item.id === id),
        );

        // get component mock data
        let selectedComponentMockData: any = {};
        mocks.forEach((item) => {
          const schemas = item.schemas;
          schemas &&
            schemas.forEach((schema) => {
              if (schema.id === id) {
                selectedComponentMockData = schema.props;
              }
            });
        });

        const newSelectedComponent = selectedComponent
          ? {
              ...selectedComponent,
              mock: selectedComponentMockData,
            }
          : initComponent;
        const wrapperId = selectedComponent ? selectedComponent.wrapper : undefined;
        const selectedWrapperComponent = wrapperId
          ? _.cloneDeep(
              componentList.find((item) => item.id === wrapperId) ||
                parsedComponentList.find((item) => item.id === wrapperId),
            )
          : undefined;
        draft.componentEditorValue = componentEditorValue;
        draft.selectedComponentId = id && selectedComponent ? id : '';
        draft.selectedComponent = newSelectedComponent;
        draft.selectedWrapperComponent = selectedWrapperComponent || initComponent;
        break;
      }

      case getType(ACTIONS.updateLoadingStatus): {
        const { value } = action.payload;
        draft.loading = value;
        break;
      }

      case getType(ACTIONS.pushEditorValue): {
        const { key, value, isWrapper } = action.payload;
        const component = isWrapper ? state.selectedWrapperComponent : state.selectedComponent;
        const newComponent = Object.assign({}, component);
        newComponent[key] = value;
        newComponent.isUpdate = true;
        if (isWrapper) {
          draft.selectedWrapperComponent = newComponent;
        } else {
          draft.selectedComponent = newComponent;
        }

        draft.editStatus = true;
        break;
      }

      case getType(ACTIONS.updateWrapperProps): {
        const { key, value } = action.payload;
        const wrapperComponent = state.selectedWrapperComponent;
        const newWrapperComponent = _.cloneDeep(wrapperComponent);
        if (!newWrapperComponent.props) {
          newWrapperComponent.props = {};
        }
        if (!newWrapperComponent.props.style) {
          newWrapperComponent.props.style = {};
        }
        newWrapperComponent.props.style[key] = value;
        newWrapperComponent.isUpdate = true;
        draft.selectedWrapperComponent = newWrapperComponent;
        draft.editStatus = true;
        break;
      }

      case getType(ACTIONS.updatePreviewModalVisible): {
        const { value } = action.payload;
        draft.previewModalVisible = value;
        break;
      }

      case getType(ACTIONS.updatePageBasicInfo): {
        const { key, value } = action.payload;
        const version = state.version;
        const newVersion = _.cloneDeep(version);
        if (
          newVersion &&
          newVersion.content &&
          (!newVersion.content.schemas || newVersion.content.schemas.length < 1)
        ) {
          newVersion.content.schemas = [
            {
              props: {
                width: '100%',
                height: '100%',
                [key]: value,
              },
              name: '',
              type: '',
              children: [],
              id: `stru_${shortId(15)}`,
            },
          ];
        } else if (newVersion.content.schemas && newVersion.content.schemas.length > 0) {
          const props = newVersion.content.schemas[0].props;
          if (props) {
            props[key] = value;
          }
        }
        draft.version = newVersion;
        draft.editStatus = true;
        draft.versionChange = Symbol('change');
        break;
      }

      case getType(ACTIONS.updateDndInfo): {
        draft.dndInfo = action.payload.value;
        break;
      }

      case getType(ACTIONS.updatePageEditStatus): {
        const { value } = action.payload;
        draft.editStatus = value;
        break;
      }

      case getType(ACTIONS.updateZoom): {
        const { zoom } = action.payload;
        draft.zoom = zoom;
        draft.versionChange = Symbol('change');
        break;
      }

      case getType(ACTIONS.updateViewModal): {
        const { viewModel } = action.payload;
        draft.viewModel = viewModel;
        draft.versionChange = Symbol('change');
        break;
      }

      case getType(ACTIONS.pushLastSteps): {
        const version = state.version;
        const lastSteps = state.lastSteps || [];
        const newLastSteps = Object.assign([], lastSteps);
        newLastSteps.push(_.cloneDeep(version));
        draft.lastSteps = newLastSteps;
        draft.lastStepStatus = true;
        break;
      }

      case getType(ACTIONS.popLastSteps): {
        const oldVersion = _.cloneDeep(state.version);
        const lastSteps = state.lastSteps || [];
        const newLastSteps = Object.assign<DslType[], DslType[]>([], lastSteps);
        const version = newLastSteps.pop();

        draft.lastSteps = newLastSteps;
        if (version) {
          oldVersion.content = version.content;
          draft.version = oldVersion;
        }

        draft.lastStepStatus = newLastSteps.length > 0;
        break;
      }

      case getType(ACTIONS.shiftNextSteps): {
        const oldVersion = _.cloneDeep(state.version);
        const nextSteps = state.nextSteps || [];
        const newNextSteps = Object.assign<DslType[], DslType[]>([], nextSteps);
        const version = newNextSteps.shift();
        draft.nextSteps = newNextSteps;
        if (version) {
          oldVersion.content = version.content;
          draft.version = oldVersion;
        }
        draft.nextStepStatus = newNextSteps.length > 0;
        break;
      }

      case getType(ACTIONS.unShiftNextSteps): {
        const version = state.version;
        const nextSteps = state.nextSteps || [];
        const newNextSteps = Object.assign([], nextSteps);
        newNextSteps.unshift(_.cloneDeep(version));

        draft.nextSteps = newNextSteps;
        draft.nextStepStatus = true;
        break;
      }

      case getType(ACTIONS.clearNextSteps): {
        draft.nextSteps = [];
        draft.nextStepStatus = false;
        break;
      }

      case getType(ACTIONS.clearLastSteps): {
        draft.lastSteps = [];
        draft.lastStepStatus = false;
        break;
      }

      case getType(ACTIONS.updateSelectedComponentUpdateStatus): {
        const { isWrapper, status } = action.payload;
        if (isWrapper) {
          draft.selectedWrapperComponent = { ...draft.selectedWrapperComponent, isUpdate: status };
        } else {
          draft.selectedComponent = { ...draft.selectedComponent, isUpdate: status };
        }
        break;
      }

      case getType(ACTIONS.updateSaveLoading): {
        const { loading } = action.payload;
        draft.saveLoading = loading;
        break;
      }

      case getType(ACTIONS.updatePublishLoading): {
        const { loading } = action.payload;
        draft.publishLoading = loading;
        break;
      }

      case getType(ACTIONS.clearComponentResource): {
        draft.parsedComponentList = [];
        draft.mockParsedComponentList = [];
        break;
      }

      case getType(ACTIONS.pushMocks): {
        draft.mocks = action.payload.mocks;
        break;
      }

      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }
      default:
        break;
    }
  });

export default templateReducer;
