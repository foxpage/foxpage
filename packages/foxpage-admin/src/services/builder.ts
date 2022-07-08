import { message } from 'antd';
import Axios from 'axios';
import _ from 'lodash';

import { PageParseOption, PARSE_PAGE_PATH, parsePage } from '@foxpage/foxpage-js-sdk';
import { Page, RelationInfo, RenderAppInfo } from '@foxpage/foxpage-types';

import { searchVariable } from '@/apis/group/application/variable';
import { REACT_COMPONENT_TYPE, WRAPPER_COMPONENT_NAME } from '@/constants/build';
import { BLANK_NODE } from '@/pages/builder/constant';
import { getBusinessI18n } from '@/pages/locale';
import { Application } from '@/types/application';
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
  Extension,
  RelationType,
} from '@/types/builder';
import shortId from '@/utils/short-id';

const tplReplaceReg = /\{|}|/g;

export const generateNodeId = () => {
  return `stru_${shortId(15)}`;
};

const generateCopyComponent = (tree: Array<ComponentStructure>, parentId: string) => {
  tree.forEach((treeItem: ComponentStructure, _index: number) => {
    const id = generateNodeId();
    treeItem.id = id;
    treeItem.parentId = parentId;
    treeItem.wrapper = treeItem.wrapper ? parentId : undefined;
    if (!treeItem.extension) {
      treeItem.extension = {};
    }
    treeItem.extension.parentId = parentId;
    // delete extendId
    delete treeItem.extension?.extendId;
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

const generateComponentList = (
  list: Array<ComponentStructure>,
  tree: Array<ComponentStructure>,
  parentId?: string,
) => {
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

/**
 * generate the extension data
 * @param parentId parent ID
 * @param sort position
 * @param extendId extend id
 * @returns extension data
 */
const extensionCreator = (parentId?: string, sort?: number, extendId?: string) => {
  const extension: Extension = {};
  if (parentId || parentId === '') {
    extension.parentId = parentId;
  }
  if (sort) {
    extension.sort = sort;
  }
  if (extendId) {
    extension.extendId = extendId;
  }
  return extension;
};

export type StructureNodeInitOptions = Partial<
  Pick<
    ComponentStructure,
    'label' | 'parentId' | 'position' | 'props' | 'relation' | 'children' | 'useStyleEditor'
  >
>;

/**
 * structure node creator
 * @param id node id
 * @param name node name
 * @param options options
 * @returns new node
 */
const initStructureNode = (id: string, name: string, options: StructureNodeInitOptions = {}) => {
  return {
    id,
    label: options.label || name,
    name,
    type: REACT_COMPONENT_TYPE,
    props: options.props || {},
    parentId: options.parentId || '',
    wrapper: options.useStyleEditor ? options.parentId || '' : '',
    children: options.children || [],
    relation: options.relation || {},
    extension: extensionCreator(options.parentId, options.position),
  } as ComponentStructure;
};

const newWrapperComponent = (
  registeredComponent: ComponentType[],
  componentName: string,
  parentId?: string,
): ComponentStructure => {
  const component = registeredComponent.find((item: any) => item.name === componentName) || {};
  const componentId = generateNodeId();
  if (component.useStyleEditor) {
    const wrapperId = generateNodeId();
    const child = initStructureNode(componentId, componentName, { parentId: wrapperId });
    return initStructureNode(wrapperId, WRAPPER_COMPONENT_NAME, {
      parentId,
      children: [child],
      useStyleEditor: true,
    });
  } else {
    return initStructureNode(componentId, componentName, { parentId });
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
    const isRootTree = tree?.[0]?.name === '' && tree?.[0]?.type === '';
    const rTree = isRootTree ? tree?.[0]?.children : tree;

    rTree.splice(position, 0, dsl);
    return;
  }

  if (tree.length > 0 && tree[0].parentId === parentId) {
    tree.splice(position, 0, dsl);
    return;
  }

  for (let i = 0; i < tree.length; i++) {
    const treeItem = tree[i];
    if (tree[i].id === parentId && treeItem.children) {
      // append at last
      const pos = position === -1 ? treeItem.children.length : position;
      treeItem.children.splice(pos, 0, dsl);
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
        // deal extension parentId
        if (!deleteItem.extension) {
          deleteItem.extension = {};
        }
        deleteItem.extension.parentId = params.parentId;
        addDsl(deleteItem, version.content.schemas, params.position || 0, versionType, params.parentId);
      } else {
        console.log(params.content, version);
      }

      break;
  }
  return version;
};

const parsePageInServer = async (page: Page, opt: PageParseOption, host: string) => {
  const result = await Axios.post(`${PARSE_PAGE_PATH}?&host=${host}`, {
    page,
    opt: {
      appId: opt.appInfo.appId,
      relationInfo: opt.relationInfo,
      locale: opt.locale,
    },
  });
  return result;
};

const mergeDsl = async (
  application: Application,
  page: DslContent,
  templates: ComponentStructure[],
  variables: VariableType[],
  conditions: ConditionContentItem[],
  functions: FuncContentItem[],
  locale: string,
) => {
  const appInfo = {
    appId: application.id,
    slug: application.slug,
    configs: {},
  } as RenderAppInfo;
  const relationInfo = {
    templates, // Template[]
    variables, // Variable[]
    conditions, // Condition[]
    functions, //FPFunction[]
  };

  const {
    builder: { parsePageFailed },
  } = getBusinessI18n();

  try {
    // @ts-ignore
    if (APP_CONFIG.env === 'dev') {
      throw new Error('is develope');
    }
    const host = application.host?.[0]?.url || '';
    if (!host) {
      throw new Error('no host');
    }
    // TODO 类型声明文件后期三端统一
    const result = (await parsePageInServer(
      page as Page,
      {
        appInfo,
        relationInfo: (relationInfo as unknown) as RelationInfo,
        locale,
      },
      `${host}/${application.slug}`,
    )) as Record<string, any>;
    if (result.status === 200) {
      if (result.data.status) {
        return { page: { ...page, schemas: result.data.result.parsedPage } };
      } else {
        message.error(parsePageFailed);
        console.error(result.data.result);
        return { page: { ...page, schemas: [] } };
      }
    }
    return {};
  } catch (e) {
    return (parsePage(page as Page, {
      appInfo,
      relationInfo: (relationInfo as unknown) as RelationInfo,
    }) as unknown) as { result: { parsedPage: DslContent }; status: boolean };
  }
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
  dsl?.forEach((component: ComponentStructure) => {
    setComponentSource(component, componentSourceMap);
    if (!pageComponentList?.find((item) => item.id === component.id)) {
      component.belongTemplate = true;
    }

    if (component.children && component.children.length > 0) {
      setSourceToDsl(component.children, componentSourceMap, pageComponentList);
    }
  });
};

const setWrapperToDsl = (dsl: ComponentStructure[]) => {
  dsl?.forEach((component: ComponentStructure) => {
    if (component.name === WRAPPER_COMPONENT_NAME && component?.children?.length > 0) {
      component.children[0].wrapper = component.id;
    }
    if (component.children && component.children.length > 0) {
      setWrapperToDsl(component.children);
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
    const variablePaths = matchArray
      .map((item: string) => item.replaceAll(/\{\{/g, ''))
      .filter((item) => !!item);

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
  dsl.forEach((component) => {
    delete component.meta;
    delete component.resource;
    delete component.schema;
    delete component.belongTemplate;
    delete component.position;
    delete component.parentId;
    delete component.useStyleEditor;
    delete component.enableChildren;
    delete component.wrapper;
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
        const relationItem = searchRes.data.find(
          (variable: VariableType) => relation[item].name === variable.name,
        );
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
  const { schemas, relation } = version?.content || {};
  if (!schemas || schemas.length === 0 || !relation) {
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
  dsl.forEach((component) => {
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

/**
 * ignore the structure node
 * @param dsl
 * @param options
 */
const filterNode = <T extends ComponentStructure>(dsl: T[], condition?: (item: T) => boolean) => {
  function doFilter(list: T[]) {
    const result: T[] = [];
    list.forEach((item) => {
      const status = condition ? condition(item) : false;
      if (status) {
        let childList: T[] = [];
        if (item.children?.length) {
          childList = doFilter(item.children as T[]);
        }
        result.push(Object.assign({}, item, { children: childList }));
      }
    });
    return result;
  }
  return doFilter(dsl);
};

/**
 * ignore blank node
 * @param dsl
 * @returns
 */
const ignoreNodeByBlankNode = (dsl: ComponentStructure[]) => {
  return filterNode(dsl, (node: ComponentStructure) => node.name !== BLANK_NODE);
};

export {
  deleteDslSource,
  filterNode,
  generateComponentList,
  generateCopyComponent,
  getComponentTemplateId,
  getDslErrors,
  getPageTemplateId,
  getPosition,
  getRelationFromProps,
  getRenderStructure,
  ignoreNodeByBlankNode,
  mergeDsl,
  newWrapperComponent,
  searchVariableRelation,
  setComponentSource,
  setSourceToDsl,
  setWrapperToDsl,
  updateDsl,
  updateRelation,
};
