import { REACT_COMPONENT_TYPE } from '@/constants/index';
import { Component, StructureNode } from '@/types/index';

import { generateStructureId } from './common';

/**
 * init node
 * @returns node
 */
export const initNode = (component: Component) => {
  return {
    id: generateStructureId(),
    label: component.category?.name || component.label || component.name,
    name: component.name,
    type: REACT_COMPONENT_TYPE,
    props: {},
    children: [],
    extension: {
      sort: 100,
    },
    version: '',
  } as StructureNode;
};

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
