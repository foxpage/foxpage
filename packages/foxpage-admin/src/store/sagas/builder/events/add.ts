import { cloneDeep } from 'lodash';

import { FileType } from '@/constants/global';
import { DSL_TPL_TYPE } from '@/constants/index';
import { store } from '@/store/index';
import { Component, FormattedData, RenderStructureNode, StructureNode } from '@/types/index';

import { getBlockRelationKey, initNode, initStructure, initStyleWrapper } from '../utils';

/**
 * add component
 * @param component component detail
 * @returns new node
 */
export const addComponent = (
  component: StructureNode[] | Component,
  opt: { componentMap: FormattedData['componentMap']; blockClone?: boolean },
) => {
  if (Array.isArray(component)) {
    return component;
  }

  if (component.type === FileType.block) {
    const { blockClone = false } = opt;
    const blockDSLMap = store.getState().builder.component.blockDSLMap;
    const curBlockContent = blockDSLMap[component.id] || {};
    // clone
    if (blockClone) {
      const blockStructure = blockDSLMap[component.id]?.schemas[0];
      const copiedStructure = cloneDeep(blockStructure) as RenderStructureNode;
      return [initStructure(copiedStructure)];
    }
    // refer
    const blockNode = curBlockContent.schemas[0];
    const blockComponent = opt.componentMap[blockNode.name] || {};
    const node = initNode({
      ...blockComponent,
      label: component.category?.name || blockComponent.label,
      componentType: DSL_TPL_TYPE,
      category: undefined,
    });
    const tpl = getBlockRelationKey(curBlockContent.id);
    const newNode = { ...node, directive: { ...(node.directive || {}), tpl: `{{${tpl}}}` } };
    return [newNode];
  } else {
    const node = initNode(component);
    const nodeComponent = opt.componentMap[node.name] || {};
    // if use style editor ,will wrapper a styleContainer
    if (nodeComponent.useStyleEditor) {
      return [initStyleWrapper(node, opt.componentMap)];
    }
    return [node];
  }
};
