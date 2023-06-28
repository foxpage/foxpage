import { BLANK_NODE } from '@/constants/index';
import { Component, Content, FormattedData, RenderStructureNode, StructureNode } from '@/types/index';

import { getStyleWrapper, initNode, isTPLNode } from '../utils';

type RemoveOptions = {
  content: Content;
  formattedData: FormattedData;
};

/**
 * update content with remove nodes
 * @param list removed list
 * @param opt
 */
export const removeComponents = <T extends StructureNode>(list: T[] = [], opt: RemoveOptions) => {
  let formatted = opt.formattedData;
  const { updates, removes } = initUpdatesAndRemoves(list, formatted);

  // remove in formatted data
  if (removes.length > 0) {
    formatted = removeFormattedData(removes, formatted);
  }

  return { formattedData: formatted, updates, removes };
};

const removeFormattedData = (list: StructureNode[] = [], formattedData: FormattedData) => {
  const formatted = Object.assign({}, formattedData);
  // remove in formatted schemas
  // formatted.formattedSchemas = removeSchemas(list, formatted.formattedSchemas);
  // remove in origin page
  removeOriginPage(list, formatted);
  // remove in id mock
  removeMock(list, formatted);
  return formatted;
};

// const removeSchemas = (list: StructureNode[] = [], schemas: RenderStructureNode[]) => {
//   let structures = schemas;
//   list.forEach((item) => {
//     structures = removeStructure(structures, item.id);
//   });
//   return structures;
// };

const removeOriginPage = (list: StructureNode[] = [], formattedData: FormattedData) => {
  const cloned = Object.assign({}, formattedData.originPageNodeMap);
  list.forEach((item) => {
    delete cloned[item.id];
    formattedData.originPageNodeMap = cloned;
  });
};

const removeMock = (list: StructureNode[] = [], formattedData: FormattedData) => {
  const cloned = Object.assign({}, formattedData.idMockMap);
  list.forEach((item) => {
    delete cloned[item.id];
    formattedData.idMockMap = cloned;
  });
};

const initUpdatesAndRemoves = <T extends StructureNode>(list: T[], formattedData: FormattedData) => {
  const updates: T[] = [];
  const removes: T[] = [];

  const mapper = (item: T, opt: { label?: string }) => {
    const isExtendNode = !!item.extension.extendId;
    const baseNode = formattedData.extendPageNodeMap[item.id];
    if (isExtendNode) {
      // if blank node will rollback
      if (item.name === BLANK_NODE) {
        removes.push(item);
      } else {
        // update extend node to blank node
        updates.push({ ...item, name: BLANK_NODE });
      }
    } else if (baseNode) {
      const _originNode = formattedData.originPageNodeMap[item.id];
      if (_originNode) {
        // TODO: for solve node extend twice bug
        removes.push(item);
      }
      // new blank node
      updates.push({
        ...initNode({ name: BLANK_NODE, label: opt.label || baseNode.label } as Component),
        extension: { extendId: item.id },
      } as T);
    } else {
      getRemoves(item, removes, formattedData.originPageNodeMap);
    }
  };

  list.forEach((item) => {
    const styleWrapper = getStyleWrapper(item, formattedData);
    if (styleWrapper) {
      mapper(styleWrapper as T, { label: item.label });
    } else {
      mapper(item, {});
    }
  });

  return { updates, removes };
};

const getRemoves = (
  node: StructureNode,
  list: StructureNode[] = [],
  originPageNodeMap: FormattedData['originPageNodeMap'],
) => {
  if (node) {
    const { childIds = [] } = node;
    list.push(node);
    if (!isTPLNode(node) && childIds.length > 0) {
      childIds.forEach((item) => {
        const node = originPageNodeMap[item];
        const { __styleNode } = (node || {}) as RenderStructureNode;
        if (__styleNode && __styleNode.id) {
          getRemoves(__styleNode, list, originPageNodeMap);
        } else {
          getRemoves(node, list, originPageNodeMap);
        }
      });
    }
  }
};
