// @ts-nocheck
export function getAttrData(node, attr) {
  if (node) {
    return node.getAttribute(attr);
  }
  return '';
}

function isComponent(node) {
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

export function getComponentNode(node) {
  if (node.tagName === 'BODY') {
    return undefined;
  }
  if (isComponent(node)) {
    return node;
  }
  return getComponentNode(node.parentNode);
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
