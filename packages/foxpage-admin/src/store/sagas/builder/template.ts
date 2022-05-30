import { message } from 'antd';
import _ from 'lodash';
import { all, call, delay, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import { updateRequireLoadStatus } from '@/actions/builder/component-load';
import { updateConditionBindDrawerVisible } from '@/actions/builder/condition';
import * as MOCK_ACTIONS from '@/actions/builder/more';
import * as ACTIONS from '@/actions/builder/template';
import {
  clonePage,
  fetchPageBuildVersion,
  fetchPageLiveVersion,
  fetchTemplateBuildVersion,
  publishPage,
  publishTemplate,
  updatePageDsl,
  updateTemplateDsl,
} from '@/apis/builder';
import { FileTypeEnum, VersionStatusEnum } from '@/constants/index';
import { BLANK_NODE } from '@/pages/builder/constant';
import { getBusinessI18n } from '@/pages/locale';
import { TemplateActionType } from '@/reducers/builder/template';
import * as utils from '@/services/builder';
import { store } from '@/store/index';
import { ConditionContentItem, ConditionItem } from '@/types/application/condition';
import { FuncContentItem } from '@/types/application/function';
import { VariableContent } from '@/types/application/variable';
import {
  ComponentDirectiveType,
  ComponentPropsType,
  ComponentSaveParams,
  ComponentSourceMapType,
  ComponentStaticSaveParams,
  ComponentStructure,
  ComponentType,
  DslType,
  MockContent,
  PageCloneParams,
  PageParam,
  RelationType,
} from '@/types/builder';
import { OptionsAction } from '@/types/index';
import { objectEmptyCheck } from '@/utils/object-empty-check';
import { getConditionRelationKey, getTemplateRelationKey } from '@/utils/relation';
import shortId from '@/utils/short-id';

import { differ, mergeContent, mockContent, positionInit } from './extend';

function generateId() {
  return `stru_${shortId(15)}`;
}

function* disposalData(
  _applicationId: string,
  oldVersion: DslType,
  componentSourceMap: ComponentSourceMapType,
  fileType?: string,
) {
  const version = _.cloneDeep<DslType>(oldVersion);
  const state = store.getState().builder.template;
  const versionType: string = fileType || state.versionType;
  if (!version?.content) {
    return;
  }

  const { templates = [], variables = [], conditions = [], functions = [] } = version.relations || {};
  const { schemas } = version.content;
  utils.setWrapperToDsl(schemas);

  if (schemas && schemas.length > 0) {
    const componentList: Array<ComponentStructure> = [];
    if (versionType === 'page') {
      schemas.forEach((item) => {
        utils.generateComponentList(componentList, _.cloneDeep(item.children) || [], schemas[0].id);
      });
    } else {
      utils.generateComponentList(componentList, _.cloneDeep(schemas));
    }

    componentList.forEach((component) => {
      utils.setComponentSource(component, componentSourceMap);
    });

    const renderStructure = utils.getRenderStructure(
      componentList,
      versionType === 'page' ? version.content.schemas[0].id : undefined,
    );

    let mergedDsl: any;
    let parsedComponentList: ComponentStructure[] = [];
    if (versionType === 'page') {
      mergedDsl = yield call(
        utils.mergeDsl,
        store.getState().group.application.settings.application,
        version.content,
        templates,
        variables,
        conditions,
        functions,
        store.getState().builder.page.locale,
      );
      utils.setSourceToDsl(mergedDsl.page.schemas, componentSourceMap, componentList);
      utils.generateComponentList(parsedComponentList, _.cloneDeep(mergedDsl.page.schemas));
    } else {
      parsedComponentList = componentList;
    }

    return {
      componentList,
      renderStructure,
      templates,
      parsedComponentList,
      parsedRenderStructure: versionType === 'page' ? mergedDsl.page.schemas : renderStructure,
    };
  }
  return {};
}

function* fetchPageRenderTree(action: TemplateActionType) {
  yield put(ACTIONS.updateLoadingStatus(true));

  const { applicationId, contentId, fileType } = action.payload as PageParam;
  const api: any = fileType === FileTypeEnum.page ? fetchPageBuildVersion : fetchTemplateBuildVersion;
  const res = yield call(api, {
    applicationId,
    id: contentId,
  });

  if (res.code === 200) {
    // render content
    let renderContent: DslType | null = res.data as DslType;

    // mock related
    let extendPage;
    const mocks: MockContent[] = [];

    // deal with extend(inherit)
    const extendId = renderContent?.content.extension?.extendId;
    if (extendId) {
      const baseRes = yield call(fetchPageLiveVersion, {
        applicationId,
        id: extendId,
      });

      if (baseRes.code === 200 && !objectEmptyCheck(baseRes.data)) {
        // back up
        yield put(ACTIONS.pushExtensionData({ baseContent: baseRes.data, curContent: renderContent }));
        // merge
        renderContent = mergeContent(_.cloneDeep(baseRes.data) as DslType, _.cloneDeep(renderContent));

        // mock
        const basePageContent = baseRes.data?.content;
        if (basePageContent) extendPage = basePageContent;
        const mockData = baseRes.data?.mock;
        if (!objectEmptyCheck(mockData)) mocks.push(mockData);
      }
    } else {
      // clear/reset
      yield put(ACTIONS.pushExtensionData());
    }

    // handle update mock id
    const mockId: string = _.get(renderContent, 'content.extension.mockId');
    if (!!mockId) {
      yield put(MOCK_ACTIONS.updateMockId(mockId));
    }

    // handle update mock data/ mock mode enable status
    const mockData = renderContent?.mock;
    if (mockData && typeof mockData === 'object' && Object.keys(mockData).length > 0) {
      mocks.push(mockData);

      // push to store
      yield put(MOCK_ACTIONS.pushMock(mockData));
    }
    const mockModeEnable = renderContent?.mock?.enable;
    yield put(MOCK_ACTIONS.updateMockMode(!!mockModeEnable));

    // handle relation templates mock data
    const relationTemplates = _.get(renderContent, 'relations.templates');
    if (relationTemplates && Array.isArray(relationTemplates) && relationTemplates.length > 0) {
      // get template mock data && generate a total one
      relationTemplates.forEach((template) => {
        const templateMockData = template?.mock;
        if (templateMockData) mocks.push(templateMockData);
      });
    }

    // record whole page mock data
    yield put(ACTIONS.pushMocks(mocks));

    if (renderContent) {
      // generate component source map
      const componentSourceMap: ComponentSourceMapType = {};
      renderContent.components?.forEach((component: ComponentType) => {
        if (component.name) {
          componentSourceMap[component.name] = component;
        }
      });

      // generate others state
      const {
        componentList,
        renderStructure,
        templates,
        parsedComponentList,
        parsedRenderStructure,
      } = yield disposalData(applicationId, renderContent, componentSourceMap, fileType);

      // generate mock
      let renderContentWithMock,
        mockComponentList = [],
        mockParsedComponentList = [],
        mockParsedRenderStructure = [];
      if (!objectEmptyCheck(mocks)) {
        renderContentWithMock = mockContent(_.cloneDeep(renderContent), extendPage, mocks, applicationId);

        if (renderContentWithMock) {
          const {
            componentList: componentListWithMock,
            parsedComponentList: parsedComponentListWithMock,
            parsedRenderStructure: parsedRenderStructureWithMock,
          } = yield disposalData(applicationId, renderContentWithMock, componentSourceMap, fileType);

          mockComponentList = componentListWithMock;
          mockParsedComponentList = parsedComponentListWithMock;
          mockParsedRenderStructure = parsedRenderStructureWithMock;
        }
      } else {
        renderContentWithMock = renderContent;
      }

      yield put(
        ACTIONS.pushTemplateData({
          componentList,
          renderStructure,
          templates,
          parsedComponentList,
          parsedRenderStructure,
          version: renderContent,
          componentSourceMap,
          versionType: fileType || '',
          mockVersion: renderContentWithMock,
          mockComponentList,
          mockParsedComponentList,
          mockParsedRenderStructure,
        }),
      );

      if (
        (!renderContent?.content?.schemas || renderContent?.content?.schemas.length === 0) &&
        fileType === FileTypeEnum.page
      ) {
        yield addVersionContent(applicationId, generateId(), { width: '100%', height: '100%' });
        yield put(ACTIONS.fetchPageRenderTree(applicationId, contentId || '', fileType));
      }
    }
  } else {
    message.error(res.msg);
  }

  yield put(ACTIONS.updateLoadingStatus(false));
  yield put(updateRequireLoadStatus(true));
}

function* addVersionContent(
  applicationId: string,
  schemaId: string,
  props: ComponentPropsType,
  successCb?: (version) => void,
  extentContentId?: string,
) {
  const {
    global: { addFailed },
  } = getBusinessI18n();
  const { version } = store.getState().builder.template;
  const res = yield call(updatePageDsl, {
    id: version.content.id,
    applicationId,
    content: {
      id: version.content.id,
      schemas: [
        {
          id: schemaId,
          name: '',
          type: '',
          props,
          children:
            version?.content?.schemas &&
            version.content.schemas.length > 0 &&
            version.content.schemas[0].children
              ? version.content.schemas[0].children
              : [],
          directive: extentContentId
            ? {
                tpl: `{{${getTemplateRelationKey(extentContentId)}}}`,
              }
            : undefined,
        },
      ],
      relation: extentContentId
        ? {
            [getTemplateRelationKey(extentContentId)]: {
              id: extentContentId,
              type: 'template',
            },
          }
        : {},
    },
  });
  if (res.code === 200) {
    successCb && successCb(res.data);
    yield put(ACTIONS.updateVersion(res.data));
  } else {
    message.error(res.msg || addFailed);
  }
}

function* saveComponent(action: TemplateActionType) {
  const { applicationId, params, deleteSelectedComponent = true, preUpdateCb } = action.payload as {
    applicationId: string;
    params: ComponentStaticSaveParams;
    deleteSelectedComponent: boolean;
    pushLastStep: boolean;
    preUpdateCb: () => void;
  };
  const { requireLoad } = params;
  if (deleteSelectedComponent) {
    yield put(ACTIONS.setSelectedComponent());
  }

  yield put(ACTIONS.pushLastSteps());
  yield put(ACTIONS.clearNextSteps());

  if (typeof preUpdateCb === 'function') {
    yield preUpdateCb();
  }
  const { componentSourceMap, version, mockVersion, versionType } = store.getState().builder.template;
  const generateParams = (type) => ({
    ...params,
    content: {
      children: params.content.children,
      id: params.content.id,
      label: params.content.label,
      name: params.content.name,
      parentId: params.content.parentId,
      props: type === 'mock' ? params.content.mock : params.content.props,
      wrapper: params.content.wrapper,
      directive: params.content.directive,
      extension: params.content.extension,
    },
  });

  const assignVersion = _.cloneDeep(version);
  const newVersion = utils.updateDsl(assignVersion, generateParams('props'), versionType);
  const desposalData = yield disposalData(applicationId, newVersion, componentSourceMap);

  // sync mock data & mockVersion & mockParsedRenderStructure
  const mockData = params.content?.mock || {};
  if (Object.keys(mockData).length > 0) {
    const { folderId } = store.getState().builder.page;
    yield put(MOCK_ACTIONS.updateMock({ applicationId, folderId, value: mockData }));
  }
  const newMockVersion = utils.updateDsl(_.cloneDeep(mockVersion), generateParams('mock'), versionType);
  const {
    componentList: mockComponentList,
    parsedComponentList: mockParsedComponentList,
    parsedRenderStructure: mockParsedRenderStructure,
  } = yield disposalData(applicationId, newMockVersion, componentSourceMap);

  yield put(
    ACTIONS.pushTemplateData({
      ...desposalData,
      version: newVersion,
      mockVersion: newMockVersion,
      mockComponentList,
      mockParsedComponentList,
      mockParsedRenderStructure,
    }),
  );
  yield put(ACTIONS.updatePageEditStatus(true));
  yield put(updateRequireLoadStatus(requireLoad));
}

function* appendComponent(action: TemplateActionType) {
  const { componentId, desc, applicationId } = action.payload as {
    componentId: string;
    desc: ComponentStructure;
    applicationId: string;
  };
  yield put(ACTIONS.pushComponentSource([desc.name]));
  const state = store.getState().builder.template;
  const { version, versionType } = state;
  const { content } = version;

  let schemaId;
  if ((!content || !content.schemas) && versionType === FileTypeEnum.page) {
    schemaId = generateId();
    yield addVersionContent(applicationId, schemaId, { width: '100%', height: '100%' });
  }

  const registeredComponent = store.getState().builder.componentList.allComponent;
  const parentId: string =
    componentId === 'root-container' ? (content.schemas ? content.schemas[0]?.id : schemaId) : componentId;
  const component = utils.newWrapperComponent(registeredComponent, desc.name, parentId);
  yield put(
    ACTIONS.saveComponent(applicationId, {
      id: content.id,
      parentId,
      type: 'add',
      content: component,
      position: desc.position,
      requireLoad: true,
    }),
  );
  yield delay(300);
  yield put(ACTIONS.setSelectedComponent(component.id));
}

function* insertComponent(action: TemplateActionType) {
  const { componentId, position, desc, parentId, applicationId } = action.payload as {
    componentId: string;
    position: string;
    desc: ComponentStructure;
    parentId: string;
    applicationId: string;
  };
  yield put(ACTIONS.pushComponentSource([desc.name]));
  const state = store.getState().builder.template;
  const version = state.version;
  const versionType: string = state.versionType;
  const renderStructure = state.renderStructure;
  const registeredComponent = store.getState().builder.componentList.allComponent;
  const componentParentId =
    parentId === 'root-container'
      ? versionType === FileTypeEnum.page
        ? version.content.schemas[0].id
        : undefined
      : parentId;

  const component = utils.newWrapperComponent(registeredComponent, desc.name, componentParentId);
  yield put(
    ACTIONS.saveComponent(applicationId, {
      id: version.content.id,
      parentId: componentParentId,
      type: 'add',
      content: component,
      position:
        position === 'before'
          ? utils.getPosition(componentId, renderStructure)
          : utils.getPosition(componentId, renderStructure) + 1,
      requireLoad: true,
    }),
  );
  yield delay(300);
  yield put(ACTIONS.setSelectedComponent(component.id));
}

function* publish(action: TemplateActionType) {
  const { applicationId } = action.payload as { applicationId: string };
  const {
    global: { publishSuccess, publishFailed },
  } = getBusinessI18n();

  function* afterSave() {
    const {
      template: { version, versionType },
      page: { contentId, fileType },
    } = store.getState().builder;
    const { id } = version;
    yield put(ACTIONS.updatePublishLoading(true));
    const rs = yield call(versionType === FileTypeEnum.page ? publishPage : publishTemplate, {
      id,
      applicationId,
      status: VersionStatusEnum.release,
    });
    yield put(ACTIONS.updatePublishLoading(false));
    if (rs.code === 200) {
      message.success(publishSuccess);
      yield put(ACTIONS.fetchPageRenderTree(applicationId, contentId, fileType));
    } else {
      message.error(rs.msg || publishFailed);
    }
  }

  yield put(ACTIONS.saveToServer(applicationId, afterSave, true));
}

function* extendTemplate(action: TemplateActionType) {
  const { contentId, successCb, applicationId } = action.payload as {
    contentId: string;
    successCb: () => void;
    applicationId: string;
  };
  yield put(ACTIONS.pushLastSteps());
  yield put(ACTIONS.clearNextSteps());
  const state = store.getState().builder.template;
  const { version, versionType } = state;

  const { schemas = [{ id: undefined }] } = version.content || {};
  const schemaId = schemas[0]?.id || generateId();
  yield addVersionContent(
    applicationId,
    schemaId,
    versionType === FileTypeEnum.page ? { width: '100%', height: '100%' } : {},
    (_version) => {
      successCb && successCb();
    },
    contentId,
  );
}

function* deleteComponent(action: TemplateActionType) {
  const { applicationId, componentId } = action.payload as { applicationId: string; componentId: string };
  const state = store.getState().builder.template;
  const { version, componentList, extensionData } = state;
  const component = componentList.find((item: { id: string }) => item.id === componentId);
  const baseNode =
    extensionData.baseStructureRecord[componentId] ||
    extensionData.baseStructureRecord[component?.extension?.extendId || ''];
  // is the exist node
  if (baseNode && component) {
    yield put(
      ACTIONS.saveComponent(applicationId, {
        id: version.content.id,
        parentId: component.parentId,
        type: 'update',
        content: {
          ...component,
          name: BLANK_NODE,
        },
        requireLoad: false,
      }),
    );
  } else {
    yield put(
      ACTIONS.saveComponent(applicationId, {
        id: version.content.id,
        type: 'delete',
        content: {
          id: componentId,
        },
        requireLoad: false,
      }),
    );
  }
  yield put(ACTIONS.setSelectedComponent());
}

function* rollbackComponent(action: TemplateActionType) {
  const { applicationId, componentId } = action.payload as { applicationId: string; componentId: string };
  const state = store.getState().builder.template;
  const { version, componentList, extensionData } = state;
  const component = componentList.find((item: { id: string }) => item.id === componentId);
  const baseNode =
    extensionData.baseStructureRecord[componentId] ||
    extensionData.baseStructureRecord[component?.extension?.extendId || ''];

  if (component) {
    yield put(
      ACTIONS.saveComponent(applicationId, {
        id: version.content.id,
        parentId: component.parentId,
        type: 'update',
        content: {
          ...baseNode,
          id: component.id,
          extension: component.extension,
        },
        requireLoad: true,
      }),
    );
  }
}

function* copyComponent(action: TemplateActionType) {
  const { applicationId, componentId } = action.payload as { applicationId: string; componentId: string };
  const state = store.getState().builder.template;
  const { version, componentList } = state;
  const copyComponent = componentList.find((item: { id: string }) => item.id === componentId);
  const id = generateId();
  if (copyComponent) {
    // remove the extendId
    delete copyComponent.extension?.extendId;
    yield put(
      ACTIONS.saveComponent(applicationId, {
        id: version.content.id,
        parentId: copyComponent.parentId,
        type: 'add',
        content: {
          ...copyComponent,
          id: id,
          children: utils.generateCopyComponent(_.cloneDeep(copyComponent.children || []), id),
        },
        position: (copyComponent.position || 0) + 1,
        requireLoad: false,
      }),
    );
  }
}

function* saveEditor(action: TemplateActionType) {
  const { applicationId, folderId, isWrapper } = action.payload as ComponentSaveParams;
  const state = store.getState().builder.template;
  const { version, mockVersion, selectedComponent, selectedWrapperComponent } = state;
  const component = isWrapper ? selectedWrapperComponent : selectedComponent;
  if (!component || !component.isUpdate) {
    return;
  }
  yield put(ACTIONS.updateSelectedComponentUpdateStatus(isWrapper, false));

  const { relation, variables, functions } = yield utils.searchVariableRelation({
    applicationId,
    folderId,
    props: component.props || {},
    oldRelation: version.content.relation,
  });

  if (relation) {
    yield put(ACTIONS.updateContentRelation(utils.updateRelation(version.content.relation, relation)));
    yield put(ACTIONS.updateVersionRelations({ variables, functions }));
  }

  // mock
  const mockModeEnable = store.getState().builder.more.mockModeEnable;
  if (mockModeEnable) {
    const {
      relation: mockRelation,
      variables: mockVariables,
      functions: mockFunctions,
    } = yield utils.searchVariableRelation({
      applicationId,
      folderId,
      props: component.mock || {},
      oldRelation: mockVersion.content.relation,
    });

    if (mockRelation) {
      yield put(
        ACTIONS.updateContentRelation(
          utils.updateRelation(mockVersion.content.relation, mockRelation),
          'mock',
        ),
      );
      yield put(
        ACTIONS.updateVersionRelations({ variables: mockVariables, functions: mockFunctions }, 'mock'),
      );
    }
  }

  yield put(
    ACTIONS.saveComponent(
      applicationId,
      {
        id: version.content.id,
        parentId: component.parentId,
        type: 'update',
        content: {
          children: isWrapper ? [state.selectedComponent] : component.children || [],
          id: component.id,
          label: component.label,
          name: component.name,
          parentId: component.parentId,
          props: component.props || {},
          mock: component.mock || {},
          wrapper: component.wrapper,
          directive: component.directive,
          extension: component.extension,
        },
        requireLoad: false,
      },
      false,
    ),
  );
}

function* saveToServer(action: TemplateActionType) {
  const { applicationId, successCb, hideMessage = false } = action.payload as {
    applicationId: string;
    successCb: () => void;
    hideMessage: boolean;
  };

  const state = store.getState().builder.template;
  const { version, versionType, editStatus } = state;
  if (!editStatus) {
    if (typeof successCb === 'function') {
      yield successCb();
    }
    return;
  }
  const {
    global: { saveSuccess, saveFailed },
  } = getBusinessI18n();

  yield put(ACTIONS.updateSaveLoading(true));
  yield delay(300);
  const savedVersion = _.cloneDeep(version);
  if (!savedVersion.content.relation) {
    savedVersion.content.relation = {};
  }
  if (savedVersion.content.relation) {
    for (const key in savedVersion.content.relation) {
      delete savedVersion.content.relation[key].content;
    }
  }
  const {
    content: { schemas, relation },
  } = savedVersion;
  utils.deleteDslSource(schemas);
  const errors = utils.getDslErrors(schemas, relation);

  for (const componentId in errors) {
    if (errors[componentId]?.length > 0) {
      errors[componentId].forEach((value) => message.error(value));
      yield put(ACTIONS.updateSaveLoading(false));
      return;
    }
  }

  const { extensionData } = store.getState().builder.template;
  // deal position
  positionInit(savedVersion.content, extensionData);
  // deal with extend(inherit)
  if (extensionData.baseContent) {
    savedVersion.content = differ(extensionData, savedVersion.content);
  }
  // handle mock id
  const { mockId } = store.getState().builder.more;
  if (!!mockId) {
    savedVersion.content.extension = Object.assign({}, savedVersion.content.extension, {
      mockId,
    });
  }

  const res = yield call(versionType === FileTypeEnum.page ? updatePageDsl : updateTemplateDsl, {
    applicationId,
    id: savedVersion.content.id,
    content: savedVersion.content,
  });
  if (res.code === 200) {
    !hideMessage && message.success(saveSuccess);
    // if not, will not publish succeed
    yield put(ACTIONS.updateVersion(res.data));
    yield put(ACTIONS.updatePageEditStatus(false));
    if (typeof successCb === 'function') {
      yield successCb();
    }
  } else {
    !hideMessage && message.error(res.msg || saveFailed);
  }

  yield put(ACTIONS.updateSaveLoading(false));
}

function* goLastStep(action: TemplateActionType) {
  const { applicationId } = action.payload as PageParam;
  yield put(ACTIONS.unShiftNextSteps());
  yield put(ACTIONS.popLastSteps());
  const state = store.getState().builder.template;
  const { version, componentSourceMap, selectedComponentId } = state;

  const desposalData = yield disposalData(applicationId, version, componentSourceMap);
  console.log('goLastStep');
  yield put(ACTIONS.pushTemplateData({ ...desposalData, version: version }));
  yield put(ACTIONS.setSelectedComponent(selectedComponentId));
  yield put(ACTIONS.updatePageEditStatus(true));
}

function* goNextStep(action: TemplateActionType) {
  const { applicationId } = action.payload as PageParam;
  yield put(ACTIONS.pushLastSteps());
  yield put(ACTIONS.shiftNextSteps());
  const state = store.getState().builder.template;
  const { version, componentSourceMap, selectedComponentId } = state;
  const desposalData = yield disposalData(applicationId, version, componentSourceMap);
  console.log('goNextStep');
  yield put(ACTIONS.pushTemplateData({ ...desposalData, version: version }));
  yield put(ACTIONS.setSelectedComponent(selectedComponentId));
  yield put(ACTIONS.updatePageEditStatus(true));
}

function* updateEditorValue(action: TemplateActionType) {
  // todo variable select
  const { key, value } = action.payload as { key: string; value: unknown };
  yield put(ACTIONS.pushEditorValue(key, value, false));
}

/**
 * update component condition
 * @param actions actions
 */
function* updateComponentCondition(actions: TemplateActionType) {
  const state = store.getState().builder;
  const { conditions } = actions.payload as { conditions: ConditionItem[] };

  const { selectedComponent, selectedWrapperComponent, version } = state.template;
  const component = selectedComponent.wrapper ? selectedWrapperComponent : selectedComponent;
  const { directive } = component;
  const newDirective: ComponentDirectiveType = directive ? { ..._.cloneDeep(directive), if: [] } : { if: [] };
  const newDirectiveIf = newDirective.if as string[];

  const newRelation: RelationType = {};

  const conditionRelations: ConditionContentItem[] = [];
  let variableRelations: VariableContent[] = [];
  let functionRelations: FuncContentItem[] = [];
  conditions.forEach((condition) => {
    const { content } = condition;
    const { id } = content;
    if (!id) {
      return;
    }
    const relationKey = getConditionRelationKey(id);
    const directiveIf = `{{${relationKey}}}`;
    const exist = newDirectiveIf.find((item) => item === directiveIf);
    if (!exist) {
      newDirectiveIf.push(directiveIf);
    }
    conditionRelations.push(content);
    if (condition.relations) {
      const { variables = [], functions = [] } = condition.relations;
      variableRelations = variableRelations.concat(variables);
      functionRelations = functionRelations.concat(functions);
    }
    newRelation[relationKey] = { type: 'condition', content, id };
  });

  const { applicationId } = state.page;
  yield put(
    ACTIONS.saveComponent(
      applicationId,
      {
        id: version.content.id,
        parentId: component.parentId,
        type: 'update',
        content: {
          children: component.children,
          id: component.id,
          label: component.label,
          name: component.name,
          parentId: component.parentId,
          props: component.props || {},
          wrapper: component.wrapper,
          type: component.type,
          directive: newDirective,
        },
        requireLoad: false,
      },
      false,
      function* cb() {
        yield put(ACTIONS.updateContentRelation(utils.updateRelation(version.content.relation, newRelation)));
        yield put(
          ACTIONS.updateVersionRelations({
            conditions: conditionRelations,
            variables: variableRelations,
            functions: functionRelations,
          }),
        );
      },
    ),
  );
  yield put(ACTIONS.pushEditorValue('directive', newDirective, selectedComponent.wrapper ? true : false));
  yield put(updateConditionBindDrawerVisible(false));
}

function* pushComponentSource(action: TemplateActionType) {
  const { names } = action.payload as { names: string[] };
  const { allComponent } = store.getState().builder.componentList;
  const newComponentSourceMap = {} as ComponentSourceMapType;
  names.forEach((name) => {
    const component = allComponent.find((item) => item.name === name);
    if (component?.name) {
      if (component) {
        newComponentSourceMap[component.name] = component;
        newComponentSourceMap[`${component.name}@${component.version}`] = component;
      }
    }

    component?.components?.forEach((item) => {
      if (item.name) {
        newComponentSourceMap[item.name] = item;
        newComponentSourceMap[`${item.name}@${item.version}`] = item;
      }
    });
  });
  yield put(ACTIONS.mergeComponentSourceMap(newComponentSourceMap));
}

function* handleClonePage(action: TemplateActionType) {
  const params = action.payload as PageCloneParams;
  const {
    global: { cloneSuccess, cloneFailed },
  } = getBusinessI18n();
  const { onSuccess } = params;
  yield put(ACTIONS.pushLastSteps());
  yield put(ACTIONS.clearNextSteps());
  const res = yield call(clonePage, params);
  if (res.code === 200) {
    message.success(cloneSuccess);
    yield put(ACTIONS.updatePageEditStatus(false));
    if (typeof onSuccess === 'function') {
      yield onSuccess();
    }
  } else {
    message.error(res.msg || cloneFailed);
  }
}

function* handleClearResource(action: TemplateActionType) {
  const { onSuccess } = action.payload as OptionsAction;
  yield put(ACTIONS.clearComponentResource());
  if (typeof onSuccess === 'function') {
    onSuccess();
  }
}

function* handleLocaleChange(action: TemplateActionType) {
  const { applicationId } = action.payload as PageParam;
  const state = store.getState().builder.template;
  const { version, componentSourceMap, selectedComponentId } = state;
  const desposalData = yield disposalData(applicationId, version, componentSourceMap);
  yield put(ACTIONS.pushTemplateData({ ...desposalData, version: version }));
  yield put(ACTIONS.setSelectedComponent(selectedComponentId));
  // yield put(ACTIONS.updatePageEditStatus(true));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchPageRenderTree), fetchPageRenderTree);
  yield takeLatest(getType(ACTIONS.appendComponent), appendComponent);
  yield takeLatest(getType(ACTIONS.insertComponent), insertComponent);
  yield takeLatest(getType(ACTIONS.saveComponent), saveComponent);
  yield takeLatest(getType(ACTIONS.publish), publish);
  yield takeLatest(getType(ACTIONS.useTemplate), extendTemplate);
  yield takeLatest(getType(ACTIONS.deleteComponent), deleteComponent);
  yield takeLatest(getType(ACTIONS.rollbackComponent), rollbackComponent);
  yield takeLatest(getType(ACTIONS.copyComponent), copyComponent);
  yield takeLatest(getType(ACTIONS.saveComponentEditorValue), saveEditor);
  yield takeLatest(getType(ACTIONS.saveToServer), saveToServer);
  yield takeLatest(getType(ACTIONS.goLastStep), goLastStep);
  yield takeLatest(getType(ACTIONS.goNextStep), goNextStep);
  yield takeLatest(getType(ACTIONS.updateEditorValue), updateEditorValue);
  yield takeLatest(getType(ACTIONS.updateComponentCondition), updateComponentCondition);
  yield takeLatest(getType(ACTIONS.pushComponentSource), pushComponentSource);
  yield takeLatest(getType(ACTIONS.clonePage), handleClonePage);
  yield takeLatest(getType(ACTIONS.clearResource), handleClearResource);
  yield takeLatest(getType(ACTIONS.localeChange), handleLocaleChange);
}

export default function* rootSaga() {
  yield all([watch()]);
}
