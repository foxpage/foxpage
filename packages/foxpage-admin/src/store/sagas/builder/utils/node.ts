import {
  BLOCK_COMPONENT_NAME,
  DSL_TPL_TYPE,
  PAGE_COMPONENT_NAME,
  REACT_COMPONENT_TYPE,
} from '@/constants/index';
import { Component, Content, RenderStructureNode, StructureNode } from '@/types/index';

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
    version: '',
  });
  structure.children?.map(initStructure);
  return structure;
};

/**
 * init root node
 * @returns node
 */
export const initRootContentNode = (component: Component) => {
  return {
    id: '',
    schemas: [initNode(component)],
    extension: {},
  } as Content;
};

/**
 * get pagenode from structure
 * @param node
 * @returns
 */
export const getRootNode = (nodes: StructureNode[] = []) => {
  return nodes.find((item) => isRootNode(item));
};

/**
 * is root node
 * @param node
 */
export const isRootNode = (node: StructureNode) => {
  return isPageNode(node) || isBlockNode(node);
};

/**
 * is pagenode
 * @param node
 * @returns
 */
export const isPageNode = (node: StructureNode) => {
  return node.name === PAGE_COMPONENT_NAME;
  // return (node.name === PAGE_COMPONENT_NAME) && (node.type === ComponentType.dslTemplate);
};

/**
 * is blocknode
 * @param node
 * @returns
 */
export const isBlockNode = (node: StructureNode) => {
  return node.name === BLOCK_COMPONENT_NAME;
};

/**
 * init mock node
 * @param node mocked node
 * @returns
 */
export const initMockNode = (node: StructureNode) => {
  return {
    id: node.id || generateStructureId(),
    name: node.name,
    props: {},
  } as unknown as StructureNode;
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

export function treeToList(nodes: StructureNode[] = [], list: StructureNode[] = []) {
  nodes.forEach((item) => {
    list.push(item);
    if (item.children && item.children?.length > 0) {
      treeToList(item.children, list);
    }
  });
}

export const isTPLNode = (nodes: StructureNode) => {
  return nodes.type === DSL_TPL_TYPE;
};
