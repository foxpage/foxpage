import { Component, DndData, File, FormattedData, RenderStructureNode, StructureNode } from '@/types/index';

import { findStructureById } from '../utils';

import { addComponent } from './add';

type DropComponentOptions = {
  formattedData: FormattedData;
  file: File;
};

/**
 * drop component get the effects(nodes)
 * @param dnd dnd data
 * @param opt options
 * @returns effects
 */
export const dropComponent = (dnd: DndData, opt: DropComponentOptions) => {
  const { dragInfo, dropIn, placement } = dnd;
  const { type = 'add', detail } = dragInfo || {};
  if (!detail) {
    return [];
  }

  const { formattedData, file } = opt;
  const { componentMap } = formattedData || {};
  let node = {} as StructureNode;
  if (type === 'add') {
    node = addComponent(detail as Component, { componentMap });
  } else {
    // TODO: style node, need to general
    const { __styleNode } = detail as RenderStructureNode;
    if (__styleNode) {
      node = __styleNode;
    } else {
      node = detail as StructureNode;
    }
  }

  const effects = placementNode(node, placement, { dropIn: dropIn as StructureNode, formattedData, file });
  return effects;
};

/**
 * placement
 * for get the effect node
 * @param node
 * @param placement  placement: 'before'|'after'|'in'
 * @param opt
 * @returns
 */
const placementNode = (
  node: StructureNode,
  placement: DndData['placement'] = 'in',
  opt: {
    dropIn: StructureNode;
    formattedData: FormattedData;
    file: File;
  },
) => {
  const { formattedData, dropIn, file } = opt;
  if (!dropIn) {
    // TODO: need to clean
    if (file.type === 'page') {
      const pageNode = Object.values(formattedData.originPageNodeMap).find((item) => item.name === 'page' || item.name === '');
      if (pageNode) {
        node.extension.parentId = pageNode.id;
      }
    }
    return [node];
  }

  const dropInTemplate = !!formattedData.templateNodeMap[dropIn.id];
  if (dropInTemplate) {
    // pageNode
    const pageNode = Object.values(formattedData.originPageNodeMap).find(item => item.name === 'page' || item.name === '');
    if (pageNode) {
      node.extension.parentId = pageNode.id;
    }
    return [node];
  }

  // drop in the page node
  const dropInComponent = formattedData.componentMap[dropIn.name];
  if (dropInComponent && dropInComponent.type === 'systemComponent' && dropInComponent.name === 'page') {
    return inPlacement(node, dropIn, formattedData);
  }

  let effects: StructureNode[] = [];
  if (placement === 'before') {
    effects = beforePlacement(node, dropIn, formattedData);
  } else if (placement === 'in') {
    effects = inPlacement(node, dropIn, formattedData);
  } else if (placement === 'after') {
    effects = afterPlacement(node, dropIn, formattedData);
  }
  return effects;
};

export const beforePlacement = (node: StructureNode, dropIn: StructureNode, formattedData: FormattedData) => {
  const { id: dropInId, extension } = dropIn;
  const { sort = 0, parentId = '', extendId = '' } = extension || {};
  let effects: StructureNode[] = [];
  const dropInExtend = !!extendId || formattedData.extendPageNodeMap[dropInId];

  node.extension.parentId = parentId;

  if (dropInExtend) {
    const preNode = getPreNode(dropIn, formattedData);
    const preNodeSort = preNode?.extension?.sort || 0;
    node.extension.sort = preNode ? preNodeSort + 1 : 1;
    effects.push(node);
  } else {
    node.extension.sort = sort || 0;
    effects.push(node);

    const preNodeSort = node.extension.sort;
    // next brothers
    const brothers = [...getChildren(parentId, formattedData)];
    const idx = brothers.findIndex((item) => item.id === node.id); // same level move
    if (idx > -1) {
      brothers.splice(idx, 1);
    }
    effects = effects.concat(getNextEffects(dropInId, preNodeSort, brothers));
  }

  return effects;
};

export const inPlacement = (node: StructureNode, dropIn: StructureNode, formattedData: FormattedData) => {
  const dropInExtend = !!dropIn.extension?.extendId;
  node.extension.parentId = dropIn.id;

  if (dropInExtend) {
    const children = getChildren(dropIn.id, formattedData);
    const lastNode = children[children?.length || 0];
    if (!!lastNode?.extension?.extendId) {
      node.extension.sort = (lastNode?.extension?.sort || 100) + 1;
    } else {
      const existExtendNode = children.find((item) => !!item.extension.extendId);
      node.extension.sort = (lastNode?.extension?.sort || 0) + (existExtendNode ? 1 : 100);
    }
  } else {
    node.extension.sort = ((dropIn.childIds?.length || 0) + 1) * 100;
  }

  return [node];
};

export const afterPlacement = (node: StructureNode, dropIn: StructureNode, formattedData: FormattedData) => {
  const { id: dropInId, extension } = dropIn;
  const { sort: dropInNodeSort = 0, parentId = '', extendId = '' } = extension || {};
  const dropInExtend = !!extendId || formattedData.extendPageNodeMap[dropInId];
  let effects: StructureNode[] = [];

  // next brothers
  const brothers = [...getChildren(parentId, formattedData)];
  const idx = brothers.findIndex((item) => item.id === node.id); // same level move
  if (idx > -1) {
    brothers.splice(idx, 1);
  }

  const curNodeSort = dropInNodeSort + (dropInExtend ? 1 : 100);
  node.extension.sort = curNodeSort;
  node.extension.parentId = parentId;
  effects.push(node);

  effects = effects.concat(getNextEffects(dropInId, curNodeSort, brothers, true));
  return effects;
};

const getNode = (id: string, formattedData: FormattedData) => {
  return findStructureById(formattedData.formattedSchemas, id);
};

const getChildren = (id: string, formattedData: FormattedData) => {
  let parent = getNode(id, formattedData);
  if (!parent) {
    parent = formattedData.originPageNodeMap[id];
    if (parent) {
      return parent.childIds?.map((item) => formattedData.originPageNodeMap[item]) || [];
    }
    const extendNode = formattedData.extendPageNodeMap[id];
    if (extendNode) {
      return [];
    }
    return [...(formattedData.formattedSchemas || [])];
  }
  return [...(parent.children || [])];
};

const getPreNode = (node: StructureNode, formattedData: FormattedData) => {
  const parent = getNode(node.extension.parentId || '', formattedData);
  const childIds = parent?.childIds || [];
  const preId = childIds[childIds.indexOf(node.id) - 1];
  const preNode = getNode(preId, formattedData);
  return preNode;
};

/**
 * get the next effect nodes by placement changed
 * end by the extend node
 * @param startId
 * @param startSort
 * @param brothers
 * @param next
 * @returns
 */
const getNextEffects = (
  startId: string,
  startSort: number,
  brothers: StructureNode[] = [],
  next?: boolean,
) => {
  const effects: StructureNode[] = [];
  const idx = brothers.findIndex((item) => item.id === startId);
  const nextChildren = idx > -1 ? brothers.splice(next ? idx + 1 : idx, brothers.length) : brothers;
  const nextExtendIdx = nextChildren.findIndex((item) => !!item.extension.extendId);
  if (nextExtendIdx > -1) {
    nextChildren.forEach((item, idx) => {
      if (idx < nextExtendIdx) {
        const { extension, children, ...rest } = item;
        effects.push({ ...rest, extension: { ...extension, sort: startSort + idx + 1 } });
      }
    });
  } else {
    getSortEffects(nextChildren, effects, (idx) => startSort + (idx + 1) * 100);
  }
  return effects;
};

/**
 * get the effect node  by sort change
 * @param list
 * @param effects
 * @param sort
 */
const getSortEffects = (
  list: StructureNode[] = [],
  effects: StructureNode[] = [],
  sort: (idx: number) => number,
) => {
  list.forEach((item, idx) => {
    const { extension, children, ...rest } = item;
    effects.push({ ...rest, extension: { ...extension, sort: sort(idx) } });
  });
};
