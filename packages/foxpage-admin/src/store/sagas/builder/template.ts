import { message } from 'antd';
import _ from 'lodash';
import { all, call, delay, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import { clearLoadedResource, updateRequireLoadStatus } from '@/actions/builder/component-load';
import * as ACTIONS from '@/actions/builder/template';
import {
  clonePage,
  fetchPageBuildVersion,
  fetchTemplateBuildVersion,
  publishPage,
  publishTemplate,
  updatePageDsl,
  updateTemplateDsl,
} from '@/apis/builder';
import { FileTypeEnum, VersionStatusEnum } from '@/constants/index';
import { TemplateActionType } from '@/reducers/builder/template';
import * as utils from '@/services/builder';
import { store } from '@/store/index';
import { ConditionContentItem, ConditionItem } from '@/types/application/condition';
import { FuncContentItem } from '@/types/application/function';
import { VariableContent } from '@/types/application/variable';
import {
  ComponentDirectiveType,
  ComponentPropsType,
  ComponentSourceMapType,
  ComponentStaticSaveParams,
  ComponentStructure,
  DslType,
  PageCloneParams,
  PageParam,
  RelationType,
} from '@/types/builder';
import { OptionsAction } from '@/types/index';
import { getConditionRelationKey, getTemplateRelationKey } from '@/utils/relation';
import shortId from '@/utils/short-id';

function* disposalData(
  applicationId: string,
  version: DslType,
  componentSourceMap: ComponentSourceMapType,
  fileType?: string,
) {
  const state = store.getState().builder.template;
  const versionType: string = fileType || state.versionType;
  if (!version?.content) {
    return;
  }

  const { templates = [], variables = [], conditions = [], functions = [] } = version.relations || {};
  const { schemas } = version.content;

  if (schemas && schemas.length > 0) {
    const componentList: Array<ComponentStructure> = [];
    if (versionType === 'page') {
      schemas.forEach(item => {
        utils.generateComponentList(componentList, _.cloneDeep(item.children) || [], schemas[0].id);
      });
    } else {
      utils.generateComponentList(componentList, _.cloneDeep(schemas));
    }

    componentList.forEach(component => {
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
        applicationId,
        version.content,
        templates,
        variables,
        conditions,
        functions,
      );
      console.log('mergedDsl =');
      console.log(mergedDsl);
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
  const { applicationId, contentId, fileType } = action.payload as PageParam;
  yield put(ACTIONS.updateLoadingStatus(true));
  const res = yield call(fileType === FileTypeEnum.page ? fetchPageBuildVersion : fetchTemplateBuildVersion, {
    applicationId,
    id: contentId,
  });

  if (res.code === 200) {
    const version = res.data;
    const componentSourceMap: ComponentSourceMapType = {};
    res.data.components?.forEach((component: ComponentStructure) => {
      componentSourceMap[component.name] = component;
    });
    const { componentList, renderStructure, templates, parsedComponentList, parsedRenderStructure } =
      yield disposalData(applicationId, version, componentSourceMap, fileType);

    yield put(
      ACTIONS.pushTemplateData({
        componentList,
        renderStructure,
        templates,
        parsedComponentList,
        parsedRenderStructure,
        version,
        componentSourceMap,
        versionType: fileType,
      }),
    );
    if (!version?.content?.schemas && fileType === FileTypeEnum.page) {
      yield addVersionContent(applicationId, `stru_${shortId(15)}`, { width: '100%', height: '100%' });
      yield put(ACTIONS.fetchPageRenderTree(applicationId, contentId, fileType));
    }
  } else {
    message.error('Fetch failed');
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
            version?.content?.schemas && version.content.schemas.length > 0 && version.content.schemas[0].children
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
    message.error('Add failed');
  }
}

function* saveComponent(action: TemplateActionType) {
  const {
    applicationId,
    params,
    deleteSelectedComponent = true,
    preUpdateCb,
  } = action.payload as {
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
  const { componentSourceMap, version, versionType } = store.getState().builder.template;

  const assignVersion = _.cloneDeep(version);
  const newVersion = utils.updateDsl(assignVersion, params, versionType);

  const desposalData = yield disposalData(applicationId, newVersion, componentSourceMap);
  yield put(ACTIONS.pushTemplateData({ ...desposalData, version: newVersion }));
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

  let schemaId;
  if ((!version.content || !version.content.schemas) && versionType === FileTypeEnum.page) {
    schemaId = `stru_${shortId(15)}`;
    yield addVersionContent(applicationId, schemaId, { width: '100%', height: '100%' });
  }
  const registeredComponent = store.getState().builder.componentList.allComponent;

  const newVersion = state.version;
  const parentId: string =
    componentId === 'root-container'
      ? newVersion.content.schemas
        ? newVersion.content.schemas[0].id
        : schemaId
      : componentId;
  yield put(
    ACTIONS.saveComponent(applicationId, {
      id: version.content.id,
      parentId,
      type: 'add',
      content: utils.newWrapperComponent(registeredComponent, desc.name, parentId),
      position: desc.position,
      requireLoad: true,
    }),
  );
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
  yield put(
    ACTIONS.saveComponent(applicationId, {
      id: version.content.id,
      parentId: componentParentId,
      type: 'add',
      content: utils.newWrapperComponent(registeredComponent, desc.name, componentParentId),
      position:
        position === 'before'
          ? utils.getPosition(componentId, renderStructure)
          : utils.getPosition(componentId, renderStructure) + 1,
      requireLoad: true,
    }),
  );
}

function* publish(action: TemplateActionType) {
  const { applicationId } = action.payload as { applicationId: string };
  const {
    template: { version, versionType },
    page: { contentId, fileType },
  } = store.getState().builder;

  function* afterSave() {
    const { id } = version;
    yield put(ACTIONS.updatePublishLoading(true));
    const rs = yield call(versionType === FileTypeEnum.page ? publishPage : publishTemplate, {
      id,
      applicationId,
      status: VersionStatusEnum.release,
    });
    yield put(ACTIONS.updatePublishLoading(false));
    if (rs.code === 200) {
      message.success('Publish succeed');
      yield put(ACTIONS.fetchPageRenderTree(applicationId, contentId, fileType));
    } else {
      message.error(rs.msg || 'Publish failed');
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
  const schemaId = schemas[0]?.id || `stru_${shortId(15)}`;
  yield addVersionContent(
    applicationId,
    schemaId,
    versionType === FileTypeEnum.page ? { width: '100%', height: '100%' } : {},
    _version => {
      successCb && successCb();
    },
    contentId,
  );
}

function* deleteComponent(action: TemplateActionType) {
  const { applicationId, componentId } = action.payload as { applicationId: string; componentId: string };
  const state = store.getState().builder.template;
  const version = state.version;
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
  yield put(ACTIONS.setSelectedComponent());
}

function* copyComponent(action: TemplateActionType) {
  const { applicationId, componentId } = action.payload as { applicationId: string; componentId: string };

  const state = store.getState().builder.template;
  const { version, componentList } = state;
  const copyComponent = componentList.find((item: { id: string }) => item.id === componentId);
  const id = `stru_${shortId(15)}`;
  if (copyComponent) {
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
  const { applicationId, isWrapper, folderId } = action.payload as {
    applicationId: string;
    folderId: string;
    isWrapper: boolean;
  };
  const state = store.getState().builder.template;
  const { version, selectedWrapperComponent, selectedComponent } = state;
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
          wrapper: component.wrapper,
          directive: component.directive,
        },
        requireLoad: false,
      },
      false,
    ),
  );
}

function* saveToServer(action: TemplateActionType) {
  const {
    applicationId,
    successCb,
    hideMessage = false,
  } = action.payload as {
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
      errors[componentId].forEach(value => message.error(value));
      yield put(ACTIONS.updateSaveLoading(false));
      return;
    }
  }

  const res = yield call(versionType === FileTypeEnum.page ? updatePageDsl : updateTemplateDsl, {
    applicationId,
    id: savedVersion.content.id,
    content: savedVersion.content,
  });
  if (res.code === 200) {
    !hideMessage && message.success('Save succeed');
    yield put(ACTIONS.updatePageEditStatus(false));
    if (typeof successCb === 'function') {
      yield successCb();
    }
  } else {
    !hideMessage && message.error(res.msg || 'Save failed');
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

  yield put(ACTIONS.pushTemplateData({ ...desposalData, version: version }));
  yield put(ACTIONS.setSelectedComponent(selectedComponentId));
  yield put(ACTIONS.updatePageEditStatus(true));
}

function* updateEditorValue(action: TemplateActionType) {
  // todo variable select
  const { key, value } = action.payload as { key: string; value: unknown };
  yield put(ACTIONS.pushEditorValue(key, value));
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
  conditions.forEach(condition => {
    const { content } = condition;
    const { id } = content;
    if (!id) {
      return;
    }
    const relationKey = getConditionRelationKey(id);
    const directiveIf = `{{${relationKey}}}`;
    const exist = newDirectiveIf.find(item => item === directiveIf);
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
}

function* pushComponentSource(action: TemplateActionType) {
  const { names } = action.payload as { names: string[] };
  const { allComponent } = store.getState().builder.componentList;
  const newComponentSourceMap = {} as ComponentSourceMapType;
  names.forEach(name => {
    const component = allComponent.find(item => item.name === name);
    if (component?.name) {
      if (component) {
        newComponentSourceMap[component.name] = component;
        newComponentSourceMap[`${component.name}@${component.version}`] = component;
      }
    }

    component?.components?.forEach(item => {
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
  const { onSuccess } = params;
  yield put(ACTIONS.pushLastSteps());
  yield put(ACTIONS.clearNextSteps());
  const res = yield call(clonePage, params);
  if (res.code === 200) {
    message.success('Clone succeed');
    yield put(ACTIONS.updatePageEditStatus(false));
    if (typeof onSuccess === 'function') {
      yield onSuccess();
    }
  } else {
    message.error(res.msg || 'Clone failed');
  }
}

function* handleClearResource(action: TemplateActionType) {
  const { onSuccess } = action.payload as OptionsAction;
  yield put(ACTIONS.clearComponentResource());
  yield put(clearLoadedResource());
  if (typeof onSuccess === 'function') {
    onSuccess();
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchPageRenderTree), fetchPageRenderTree);
  yield takeLatest(getType(ACTIONS.appendComponent), appendComponent);
  yield takeLatest(getType(ACTIONS.insertComponent), insertComponent);
  yield takeLatest(getType(ACTIONS.saveComponent), saveComponent);
  yield takeLatest(getType(ACTIONS.publish), publish);
  yield takeLatest(getType(ACTIONS.useTemplate), extendTemplate);
  yield takeLatest(getType(ACTIONS.deleteComponent), deleteComponent);
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
}

export default function* rootSaga() {
  yield all([watch()]);
}
