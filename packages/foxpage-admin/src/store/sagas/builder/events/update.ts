import { PAGE_COMPONENT_NAME } from '@/constants/component';
import { FormattedData, Mock, RenderStructureNode, Schemas, StructureNode } from '@/types/index';

import { nodeDiff } from '../services/index';
import { mapToTree, pickNode } from '../utils';

/**
 * update dsl with update nodes
 * @param list update nodes
 * @param formattedData
 * @returns schemas
 */
export const updateContent = <K extends StructureNode | RenderStructureNode, T extends K | Schemas>(
  list: T[] = [],
  formattedData: FormattedData,
) => {
  const formatted = { ...formattedData };

  // node mapper
  const mapper = (item: K) => {
    const { id, extension } = item;
    const { extendId = '' } = extension || {};
    const node = formatted.originPageNodeMap[id];
    let nodeParentId = '';
    let nodeId = '';
    const extendNode = formatted.extendPageNodeMap[extendId];
    const baseNode = formatted.extendPageNodeMap[id];
    let newNode = pickNode(item); // updated

    // get new node (contain extend logic)
    if (baseNode) {
      const diffed = nodeDiff(baseNode, newNode);
      if (diffed) {
        diffed.extension.parentId = baseNode.extension?.parentId || '';
        newNode = diffed as K;
      }
    } else if (extendNode) {
      const baseNode = formatted.extendPageNodeMap[extendId];
      const diffed = nodeDiff(baseNode, newNode);
      if (diffed) {
        diffed.extension.parentId = extendNode.extension?.parentId || '';
        newNode = { ...diffed, id: newNode.id } as K;
      }
    } else if (node) {
      nodeParentId = node.extension?.parentId || '';
      nodeId = node.id;
      newNode = { ...node, ...newNode };
    }

    // for move cross level
    if (newNode.extension?.parentId !== nodeParentId) {
      const oldParent = formatted.originPageNodeMap[nodeParentId];
      if (oldParent) {
        const childIds = oldParent.childIds?.filter((item) => item !== nodeId) || [];
        const _oldParent = { ...oldParent, childIds };
        formatted.originPageNodeMap = { ...formatted.originPageNodeMap, [_oldParent.id]: _oldParent };
      }
    }

    // update with parent node
    const parent = formatted.originPageNodeMap[newNode.extension?.parentId || ''];
    if (parent) {
      const childIds = Array.from(new Set(parent.childIds?.concat([newNode.id])));
      const newParent = { ...parent, childIds } as StructureNode;
      formatted.originPageNodeMap = {
        ...formatted.originPageNodeMap,
        [newParent.id]: newParent,
        [newNode.id]: newNode,
      };
    } else if (!formatted.extendPageNodeMap[newNode.id]) {
      formatted.originPageNodeMap = { ...formatted.originPageNodeMap, [newNode.id]: newNode };
    }
  };

  list.forEach((item) => mapper(item as unknown as K));
  // to generate new content
  let newContent = mapToTree(formatted.originPageNodeMap);
  // extend page node
  const extendPageNode = newContent.find(
    (item) => item.name === PAGE_COMPONENT_NAME && !!item.extension.extendId,
  );
  if (extendPageNode) {
    const { children = [] } = extendPageNode;
    extendPageNode.children = [];
    newContent = newContent.concat(children);
  }
  return newContent;
};

/**
 * update mock content
 * @param list
 * @param formattedData
 * @returns
 */
export const updateMockContent = <K extends StructureNode | RenderStructureNode, T extends K | Schemas>(
  list: T[] = [],
  mock: Mock,
) => {
  const schemas = [...(mock.schemas || [])];

  // node mapper
  const mapper = (item: K) => {
    const { id } = item;
    const idx = schemas.findIndex((node) => node.id === id);
    if (idx > -1) {
      schemas.splice(idx, 1, { ...schemas[idx], ...item });
    } else {
      schemas.push(item);
    }
  };

  list.forEach((item) => mapper(item as unknown as K));
  return schemas;
};

/**
 * check is node or mock node
 * @param node
 * @returns
 */
export const isNode = (node: StructureNode) => {
  return !!node.extension || node.label || node.type || node.version;
};
