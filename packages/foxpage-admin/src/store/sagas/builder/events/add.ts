import { cloneDeep } from 'lodash';

import { FileType } from '@/constants/global';
import { store } from '@/store/index';
import { Component, FormattedData, RenderStructureNode } from '@/types/index';

import { initNode, initStructure, initStyleWrapper } from '../utils';

/**
 * add component
 * @param component component detail
 * @returns new node
 */
export const addComponent = (component: Component, opt: { componentMap: FormattedData['componentMap'] }) => {
  if (component.type === FileType.block) {
    const blockDSLMap = store.getState().builder.component.blockDSLMap;
    const blockStructure = blockDSLMap[component.id]?.schemas[0];
    const copiedStructure = cloneDeep(blockStructure) as RenderStructureNode;
    return initStructure(copiedStructure);
  } else {
    const node = initNode(component);
    const nodeComponent = opt.componentMap[node.name] || {};
    // if use style editor ,will wrapper a styleContainer
    if (nodeComponent.useStyleEditor) {
      return initStyleWrapper(node, opt.componentMap);
    }
    return node;
  }
};
