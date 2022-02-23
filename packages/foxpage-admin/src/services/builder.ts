import { message } from 'antd';
import _ from 'lodash';

import { parsePage } from '@foxpage/foxpage-js-sdk';
import { Page, RelationInfo, RenderAppInfo } from '@foxpage/foxpage-types';

import { searchVariable } from '@/apis/group/application/variable/index';
import { REACT_COMPONENT_TYPE, WRAPPER_COMPONENT_NAME } from '@/constants/build';
import { getBusinessI18n } from '@/pages/locale';
import { ConditionContentItem } from '@/types/application/condition';
import { FuncContentItem } from '@/types/application/function';
import VariableType, { VariableContent } from '@/types/application/variable';
import {
  ComponentSourceMapType,
  ComponentStaticSaveParams,
  ComponentStructure,
  ComponentType,
  DslContent,
  DslError,
  DslType,
  RelationType,
} from '@/types/builder';
import shortId from '@/utils/short-id';

const tplReplaceReg = /\{|}|/g;

const generateCopyComponent = (tree: Array<ComponentStructure>, parentId: string) => {
  tree.forEach((treeItem: ComponentStructure, _index: number) => {
    const id = `stru_${shortId(15)}`;
    treeItem.id = id;
    treeItem.parentId = parentId;
    treeItem.wrapper = treeItem.wrapper ? parentId : undefined;
    if (treeItem.children && treeItem.children.length > 0) {
      generateCopyComponent(treeItem.children, id);
    }
  });
  return tree;
};

const getRenderStructure = (list: Array<ComponentStructure>, parentId?: string) => {
  return list.filter((item: ComponentStructure) => {
    if (item.parentId === parentId) {
      item.children = getRenderStructure(list, item.id);
      return true;
    }
    return false;
  });
};

const generateComponentList = (list: Array<ComponentStructure>, tree: Array<ComponentStructure>, parentId?: string) => {
  tree?.forEach((treeItem: ComponentStructure, index: number) => {
    treeItem.position = index;
    treeItem.parentId = parentId;
    if (treeItem.children && treeItem.children.length > 0) {
      generateComponentList(list, treeItem.children, treeItem.id);
    }
    if (treeItem.name) {
      list.push(treeItem);
    }
  });
};

const newWrapperComponent = (
  registeredComponent: ComponentType[],
  componentName: string,
  parentId?: string,
): ComponentStructure => {
  const component = registeredComponent.find((item: any) => item.name === componentName) || {};
  if (component.useStyleEditor) {
    const wrapperId = `stru_${shortId(15)}`;
    const componentId = `stru_${shortId(15)}`;
    return {
      id: wrapperId,
      label: WRAPPER_COMPONENT_NAME,
      name: WRAPPER_COMPONENT_NAME,
      parentId,
      type: REACT_COMPONENT_TYPE,
      children: [
        {
          id: componentId,
          label: componentName,
          name: componentName,
          type: REACT_COMPONENT_TYPE,
          props: {},
          parentId: wrapperId,
          wrapper: wrapperId,
          children: [],
          relation: {},
        },
      ],
    };
  } else {
    return {
      id: `stru_${shortId(15)}`,
      label: componentName,
      name: componentName,
      parentId,
      children: [],
      type: REACT_COMPONENT_TYPE,
    };
  }
};

const getPosition = (componentId: string, tree: ComponentStructure[]): number => {
  let index = 0;
  for (let i = 0; i < tree.length; i++) {
    const treeItem = tree[i];
    if (treeItem.id === componentId) {
      index = i;
      break;
    } else if (treeItem.children && treeItem.children.length > 0) {
      index = getPosition(componentId, treeItem.children);
    }
  }
  return index;
};

const addDsl = (
  dsl: ComponentStructure,
  tree: ComponentStructure[],
  position: number,
  versionType: string,
  parentId?: string,
) => {
  if (!parentId || parentId === '') {
    tree.splice(position, 0, dsl);
    return;
  }

  if (tree.length > 0 && tree[0].parentId === parentId) {
    tree.splice(position, 0, dsl);
    return;
  }
  for (let i = 0; i < tree.length; i++) {
    const treeItem = tree[i];
    if (tree[i].id === parentId && treeItem.children) {
      treeItem.children.splice(position, 0, dsl);
      return;
    } else if (treeItem.children && treeItem.children.length > 0) {
      addDsl(dsl, treeItem.children, position, versionType, parentId);
    }
  }
};
const changeDsl = (dsl: ComponentStructure, tree: ComponentStructure[]) => {
  for (let i = tree.length - 1; i > -1; i--) {
    const treeItem = tree[i];
    if (treeItem.id === dsl.id) {
      tree[i] = dsl;
      return;
    } else if (treeItem.children && treeItem.children.length > 0) {
      changeDsl(dsl, treeItem.children);
    }
  }
};
const deleteDsl = (dsl: ComponentStructure, tree: ComponentStructure[]): ComponentStructure => {
  let deleteItem;
  for (let i = tree.length - 1; i > -1; i--) {
    const treeItem = tree[i];
    if (treeItem.id === dsl.id) {
      deleteItem = _.cloneDeep(treeItem);
      tree.splice(i, 1);
      break;
    } else if (treeItem.children && treeItem.children.length > 0 && !deleteItem) {
      deleteItem = deleteDsl(dsl, treeItem.children);
    }
  }
  return deleteItem;
};

const updateDsl = (version: DslType, params: ComponentStaticSaveParams, versionType: string) => {
  switch (params.type) {
    case 'add':
      if (!params.parentId && !version.content.schemas) {
        version.content.schemas = [params.content];
        version.content.relation = {};
      } else {
        addDsl(params.content, version.content.schemas, params.position || 0, versionType, params.parentId);
      }
      break;
    case 'update':
      changeDsl(params.content, version.content.schemas);
      break;
    case 'delete':
      deleteDsl(params.content, version.content.schemas);
      break;
    case 'move':
      const deleteItem = deleteDsl(params.content, version.content.schemas);
      if (deleteItem) {
        deleteItem.parentId = params.parentId;
        addDsl(deleteItem, version.content.schemas, params.position || 0, versionType, params.parentId);
      } else {
        console.log(params.content, version);
      }

      break;
  }
  return version;
};

const mergeDsl = async (
  applicationId: string,
  page: DslContent,
  templates: ComponentStructure[],
  variables: VariableType[],
  conditions: ConditionContentItem[],
  functions: FuncContentItem[],
) => {
  const appInfo = {
    appId: applicationId,
    slug: '/',
    configs: {},
  } as RenderAppInfo;
  const relationInfo = {
    templates, // Template[]
    variables, // Variable[]
    conditions, // Condition[]
    functions, //FPFunction[]
  };
  console.log(relationInfo, page);
  // TODO 类型声明文件后期三端统一
  return parsePage(page as Page, { appInfo, relationInfo: relationInfo as unknown as RelationInfo });
};

const setComponentSource = (component: ComponentStructure, componentSourceMap: ComponentSourceMapType) => {
  if (!component || !component.name) {
    return;
  }
  const source =
    (component.version === '' || !component.version
      ? componentSourceMap[component.name]
      : componentSourceMap[`${component.name}@${component.version}`]) || {};
  component.resource = source.resource;
  component.schema = source.schema;
  component.meta = source.meta;
  component.useStyleEditor = source.useStyleEditor;
  component.enableChildren = source.enableChildren;
};

const setSourceToDsl = (
  dsl: ComponentStructure[],
  componentSourceMap: ComponentSourceMapType,
  pageComponentList: ComponentStructure[],
) => {
  dsl?.forEach((component: any) => {
    setComponentSource(component, componentSourceMap);
    if (!pageComponentList?.find(item => item.id === component.id)) {
      component.belongTemplate = true;
    }

    if (component.children && component.children.length > 0) {
      setSourceToDsl(component.children, componentSourceMap, pageComponentList);
    }
  });
};

const getRelationFromProps = (propsString: string): RelationType => {
  if (!propsString) {
    return {};
  }
  const reg = /\{\{.*?(?=(\}\}))/g;
  const matchArray = propsString.match(reg);
  if (!matchArray) {
    return {};
  } else {
    const relation: RelationType = {};
    const variablePaths = matchArray.map((item: string) => item.replaceAll(/\{\{/g, '')).filter(item => !!item);

    variablePaths.forEach((path: string) => {
      const array = path.split(':');
      if (array.length > 0 && !array[0].startsWith('__')) {
        relation[path] = { type: 'variable', name: array[0], id: '' };
      }
    });
    return relation;
  }
};

const updateRelation = (oldRelation: RelationType, relation: RelationType) => {
  return { ...oldRelation, ...relation };
};

const deleteDslSource = (dsl: ComponentStructure[]) => {
  dsl.forEach(component => {
    delete component.meta;
    delete component.resource;
    delete component.schema;
    delete component.belongTemplate;
    delete component.position;
    delete component.parentId;
    // TODO 处理没有type的历史数据。完事之后删掉这段代码
    component.type === REACT_COMPONENT_TYPE;
    if (component.children && component.children.length > 0) {
      deleteDslSource(component.children);
    }
  });
};

// TODO 对于过度状态的变量保存需要优化
const searchVariableRelation = async (params: {
  applicationId: string;
  folderId?: string;
  props: unknown;
  oldRelation: RelationType;
}): Promise<{
  relation: RelationType;
  variables: VariableContent[];
  functions: FuncContentItem[];
  hasError: boolean;
}> => {
  const {
    variable: { notExist },
  } = getBusinessI18n();
  const { applicationId, folderId, props, oldRelation } = params;
  const relation: RelationType = getRelationFromProps(JSON.stringify(props || {}));
  const variableSearches: string[] = [];
  const existRelations: RelationType = {};
  for (const item in relation) {
    if (!(item in oldRelation) || !oldRelation[item].id) {
      variableSearches.push(relation[item].name || '');
    } else {
      existRelations[item] = oldRelation[item];
      delete relation[item];
    }
  }

  const variables: VariableContent[] = [];
  const functions: FuncContentItem[] = [];
  const result = { relation: { ...existRelations, ...relation }, variables, functions, hasError: false };

  if (variableSearches.length > 0) {
    const searchRes = await searchVariable({ applicationId, id: folderId, names: variableSearches });
    if (searchRes.data && searchRes.code === 200) {
      for (const item in relation) {
        const relationItem = searchRes.data.find((variable: VariableType) => relation[item].name === variable.name);
        if (relationItem) {
          result.variables.push(relationItem.content);
          const itemRelations = relationItem.relations;
          if (itemRelations?.variables) {
            result.variables = result.variables.concat(itemRelations.variables);
          }
          if (itemRelations?.functions) {
            result.functions = result.functions.concat(itemRelations.functions);
          }
          relation[item].id = relationItem.content.id;
          delete relation[item].name;
        } else {
          delete relation[item];
        }
      }
    }
  }
  for (const item in result.relation) {
    if (!result.relation[item].id) {
      message.error(notExist.replace('${name}', item));
      result.hasError = true;
      delete result.relation[item];
    }
  }
  return result;
};

const getPageTemplateId = (version: DslType) => {
  const schemas = version?.content?.schemas;
  if (schemas?.length === 0) {
    return undefined;
  }
  const relation = version.content.relation;
  if (!relation) {
    return undefined;
  }
  const tpl = (schemas[0]?.directive?.tpl as string) || '';
  return relation[tpl.replace(tplReplaceReg, '')]?.id;
};

const getComponentTemplateId = (component: ComponentStructure, relation: RelationType) => {
  if (!relation || !component) {
    return undefined;
  }
  const tpl = (component.directive?.tpl as string) || '';
  return relation[tpl.replace(tplReplaceReg, '')]?.id;
};

const getDslErrors = (dsl: ComponentStructure[], relation: RelationType) => {
  let error: DslError = {};
  dsl.forEach(component => {
    const componentRelation: RelationType = getRelationFromProps(JSON.stringify(component.props || {}));
    if (componentRelation) {
      for (const relationItem in componentRelation) {
        const existRelation = relation[relationItem];
        if (!existRelation?.id) {
          if (error[component.id]) {
            error[component.id].push(`Variable(${relationItem}) no exist!`);
          } else {
            error[component.id] = [`Variable(${relationItem}) no exist!`];
          }
        }
      }
    }
    if (component.children && component.children.length > 0) {
      error = {
        ...error,
        ...getDslErrors(component.children, relation),
      };
    }
  });
  return error;
};

export {
  deleteDslSource,
  generateComponentList,
  generateCopyComponent,
  getComponentTemplateId,
  getDslErrors,
  getPageTemplateId,
  getPosition,
  getRelationFromProps,
  getRenderStructure,
  mergeDsl,
  newWrapperComponent,
  searchVariableRelation,
  setComponentSource,
  setSourceToDsl,
  updateDsl,
  updateRelation,
};
