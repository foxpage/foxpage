import { RenderStructure, RenderStructureNode } from '@foxpage/foxpage-client-types';

export function getAttrData(node, attr) {
  if (node) {
    return node.getAttribute(attr);
  }
  return '';
}

function isComponent(node: HTMLElement) {
  return getAttrData(node, 'data-type') === 'component' && getAttrData(node, 'data-component-id');
}

function getParentNode(node) {
  if (node.tagName === 'BODY') {
    return undefined;
  }
  if (getAttrData(node, 'data-type') === 'layer') {
    return node.childNodes[0];
  }
  return getParentNode(node.parentNode);
}

export function getComponentNode(node: HTMLElement) {
  if (node.tagName === 'BODY') {
    return undefined;
  }
  if (isComponent(node)) {
    return node;
  }
  return getComponentNode(node.parentNode as HTMLElement);
}

export function getParentId(node) {
  const parentNode = getParentNode(node);
  if (parentNode) {
    return getAttrData(parentNode, 'data-component-id');
  }
  return '';
}

export function isChildrenListNode(child) {
  return child && getAttrData(child, 'data-type') === 'childrenList';
}

export function getFirstChildNode(node) {
  const children = node.parentNode ? node.parentNode.childNodes : [];
  for (let i = 0; i < children.length; i++) {
    if (isChildrenListNode(children[i])) {
      const childs = children[i].childNodes || [];
      if (childs[0] && isComponent(childs[0].childNodes[0])) {
        return childs[0].childNodes[0];
      }
      return '';
    }
  }
  return '';
}

export function getRootLastNode(rootDom) {
  if (isChildrenListNode(rootDom.childNodes[0])) {
    const childs = rootDom.childNodes[0].childNodes || [];
    const idx = childs.length - 1;
    if (childs[idx] && isComponent(childs[idx].childNodes[0])) {
      return childs[idx].childNodes[0];
    }
    return '';
  }
  return '';
}

export function getNodeData(node) {
  const componentId = getAttrData(node, 'data-component-id');
  const parentId = getAttrData(node, 'data-parent-id');
  const destIndex = getAttrData(node, 'data-index');
  return { componentId, parentId, destIndex };
}

export function newDnd(method, pos, componentId, hoverComponentId, parentId, destIndex, rect) {
  return {
    method,
    pos,
    hoverComponentId,
    componentId,
    parentId,
    destIndex,
    rect,
  };
}

export function newRect(top, width, height, bottom) {
  return {
    top,
    width,
    height,
    bottom,
  };
}

export function filterTree(tree: RenderStructureNode[], searchValue: string) {
  if (!searchValue) {
    return tree;
  }
  const trimmedSearchValue = searchValue.trim().toLowerCase();

  const result = tree.reduce((acc, node) => {
    let matchingNode = (node.label || node.name).toLowerCase().includes(trimmedSearchValue) && node;
    if (node.children) {
      if (matchingNode) {
        const matchingChildren = filterTree(node.children, searchValue);
        if (matchingChildren.length > 0) {
          matchingNode = { ...matchingNode, children: matchingChildren };
        }
        acc.push(matchingNode);
      } else {
        const matchingChildren = filterTree(node.children, searchValue);
        if (matchingChildren.length > 0) {
          acc.push({ ...node, children: matchingChildren });
        }
      }
    }
    return acc;
  }, [] as RenderStructureNode[]);

  return result;
}

export function insertRootNodeOnStructureTree(structure: RenderStructureNode[], rootNode, readOnly) {
  let showStructures: RenderStructureNode[] = [];
  if (rootNode) {
    // config right-click menu
    // TODO:
    showStructures = [
      {
        ...rootNode,
        __editorConfig: {
          ...(rootNode.__editorConfig || {}),
          rightClickConfig: {
            enableCopyIt: false,
            enablePasteBefore: false,
            enablePasteAfter: false,
            enablePasteIn: !readOnly,
          },
        },
        children: structure,
      },
    ];
  } else {
    showStructures = structure;
  }
  return showStructures;
}

export function mapTreeToList({
  nodes,
  depth = 0,
  idx,
  expandIds,
  list = [],
}: {
  nodes: RenderStructure;
  depth?: number;
  idx: number;
  expandIds: string[];
  list?: (RenderStructureNode & { depth: number; dataIndex: number })[];
}) {
  nodes.forEach((node, index) => {
    const expanded = !(expandIds.indexOf(node.id) > -1);
    let newDepth = depth;
    const dataIndex = node.__styleNode ? idx : index;

    if (node.__editorConfig?.showInStructure !== false) {
      list.push({ ...node, depth, dataIndex });
      newDepth++;
    }

    if (node.children && expanded) {
      mapTreeToList({ nodes: node.children, depth: newDepth, idx: dataIndex, expandIds, list });
    }
  });
}
