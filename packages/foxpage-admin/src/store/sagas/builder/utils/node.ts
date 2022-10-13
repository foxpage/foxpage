import { REACT_COMPONENT_TYPE, PAGE_COMPONENT_NAME, BLOCK_COMPONENT_NAME } from '@/constants/index';
import { Component, RenderStructureNode, StructureNode, Content } from '@/types/index';

import { generateStructureId } from './common';

/**
 * init node
 * @returns node
 */
export const initNode = (component: Component) => {
  const { category, label, name, defaultValue, componentType } = component;
  return {
    id: generateStructureId(),
    label: category?.name || label || name,
    name: name,
    type: componentType || REACT_COMPONENT_TYPE,
    props: defaultValue?.props || {},
    children: [],
    extension: {
      sort: 100,
    },
    version: '',
  } as StructureNode;
};

export const initStructure = (structure: RenderStructureNode) => {
  Object.assign(structure, {
      id: generateStructureId(),
      extension: {
        sort: 100,
      },
      version: ''
    });
  structure.children?.map(initStructure)
  return structure
};

/**
 * init root node
 * @returns node
 */
 export const initRootContentNode = (component: Component) => {
  return {
    id: '',
    schemas: [initNode(component)],
    extension: {}
  } as Content;
};

/**
 * get pagenode from structure
 * @param node 
 * @returns 
 */
 export const getRootNode = (nodes: StructureNode[] = []) => {
  return nodes.find(item => isPageNode(item) || isBlockNode(item));
}

/**
 * is pagenode
 * @param node 
 * @returns 
 */
export const isPageNode = (node: StructureNode) => {
  return node.name === PAGE_COMPONENT_NAME;
}

/**
 * is blocknode
 * @param node 
 * @returns 
 */
export const isBlockNode = (node: StructureNode) => {
  return node.name === BLOCK_COMPONENT_NAME;
}

/**
 * init mock node
 * @param node mocked node
 * @returns
 */
export const initMockNode = (node: StructureNode) => {
  return ({
    id: node.id || generateStructureId(),
    name: node.name,
    props: {},
  } as unknown) as StructureNode;
};

/**
 * pick node
 * @param node
 * @returns
 */
export const pickNode = <T extends StructureNode>(node: T) => {
  return {
    id: node.id,
    label: node.label,
    name: node.name,
    props: node.props,
    version: node.version,
    type: node.type,
    children: node.children,
    extension: node.extension,
    directive: node.directive,
  } as T;
};
