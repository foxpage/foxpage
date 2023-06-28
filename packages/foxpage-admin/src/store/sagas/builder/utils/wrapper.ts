import { STYLE_CONTAINER } from '@/constants/index';
import { FormattedData, StructureNode } from '@/types/index';

import { initNode } from './node';

// style container wrapper
/**
 * get style wrapper node
 * @param node current node
 * @param formattedData formatted data
 * @returns style node
 */
export const getStyleWrapper = (node: StructureNode, formattedData: FormattedData) => {
  const { componentMap = {}, originPageNodeMap, extendPageNodeMap } = formattedData;
  const component = componentMap[node.name];
  if (!component) {
    return null;
  }
  const { useStyleEditor = false } = component;
  if (useStyleEditor) {
    const nodeParentId = node.extension?.parentId || '';
    let parent: StructureNode | null = originPageNodeMap[nodeParentId];
    if (!parent) {
      // parent id had changed, will find from extend and origin
      parent = Object.values(originPageNodeMap || {}).find(
        (item) => item.extension?.extendId === nodeParentId,
      ) as StructureNode;
    }
    if (!parent) {
      parent = extendPageNodeMap[nodeParentId];
    }
    return parent && parent.name === STYLE_CONTAINER ? { ...parent } : null;
  }

  return null;
};

/**
 * init style node
 * @param node current node
 * @param componentMap component map
 * @returns styled node
 */
export const initStyleWrapper = (node: StructureNode, componentMap: FormattedData['componentMap']) => {
  const styleContainerComponent = componentMap[STYLE_CONTAINER];
  if (styleContainerComponent) {
    const styleNode = initNode(styleContainerComponent);

    node.extension.parentId = styleNode.id;
    styleNode.children = [node];

    return styleNode;
  }
  return node;
};
