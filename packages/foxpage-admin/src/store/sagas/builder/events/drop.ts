import { PAGE_COMPONENT_NAME } from '@/constants/index';
import { store } from '@/store/index';
import { Component, DndData, File, FormattedData, RenderStructureNode, StructureNode } from '@/types/index';

import { findBrothers, findBrothersByParentId } from '../utils';

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
export const dropComponent = (
  dnd: DndData,
  opt: DropComponentOptions,
): { adds?: StructureNode[]; effects?: StructureNode[] } => {
  const { dragInfo, dropIn, placement } = dnd;
  const { type = 'add', detail } = dragInfo || {};
  if (!detail) {
    return {};
  }

  const { formattedData, file } = opt;
  const { componentMap } = formattedData || {};
  // add
  if (type === 'add') {
    let effects: StructureNode[] = [];
    const nodes = addComponent(detail as Component | StructureNode[], { componentMap });
    nodes.forEach((item) => {
      const _effects = placementNode(item, placement, {
        dropIn: dropIn as StructureNode,
        formattedData,
        file,
      });
      effects = effects.concat(_effects);
    });

    return { adds: nodes, effects };
  }
  // move
  // TODO: style node, need to general
  let node = {} as StructureNode;
  const { __styleNode } = detail as RenderStructureNode;
  if (__styleNode) {
    node = __styleNode;
  } else {
    node = detail as StructureNode;
  }
  const effects = placementNode(node, placement, { dropIn: dropIn as StructureNode, formattedData, file });
  return { effects };
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
  const { formattedData, dropIn } = opt;
  const rootNode = store.getState().builder.main.pageNode;
  if (!dropIn) {
    if (rootNode) {
      return inPlacement(node, rootNode, formattedData);
    }
    return [node];
  }

  const dropInTemplate = !!formattedData.templateNodeMap[dropIn.id];
  if (dropInTemplate) {
    // pageNode
    if (rootNode) {
      node.extension.parentId = rootNode.id;
    }
    return [node];
  }

  // drop in the page node
  const dropInComponent = formattedData.componentMap[dropIn.name];
  if (
    dropInComponent &&
    dropInComponent.type === 'systemComponent' &&
    dropInComponent.name === PAGE_COMPONENT_NAME
  ) {
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

/**
 * before placement
 * @param node
 * @param dropIn
 * @param formattedData
 * @returns
 */
export const beforePlacement = (node: StructureNode, dropIn: StructureNode, formattedData: FormattedData) => {
  const { id: dropInId, extension } = dropIn;
  const { sort = 0, parentId = '' } = extension || {};
  let effects: StructureNode[] = [];
  const dropInExtend = hadExtendNode(dropIn, formattedData);

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
    const brothers = [...(findBrothers(formattedData.formattedSchemas, dropIn.id) || [])];
    const idx = brothers.findIndex((item) => item.id === node.id); // same level move
    if (idx > -1) {
      brothers.splice(idx, 1);
    }
    effects = effects.concat(
      getNextEffects({ startId: dropInId, startSort: preNodeSort, next: false }, brothers, formattedData),
    );
  }

  return effects;
};

/**
 * in placement
 * @param node
 * @param dropIn
 * @param formattedData
 * @returns
 */
export const inPlacement = (node: StructureNode, dropIn: StructureNode, formattedData: FormattedData) => {
  const { extendId = '' } = dropIn.extension || {};
  const dropInExtend = !!extendId;
  const parentId = extendId || dropIn.id;
  node.extension.parentId = parentId;

  if (dropInExtend) {
    const children = [...(findBrothersByParentId(formattedData.formattedSchemas, parentId) || [])];
    const lastNode = children[children.length - 1] || {};
    const { extendId: lastNodeExtendId = '', sort: lastNodeSort = 0 } = lastNode.extension || {};

    if (!!lastNodeExtendId) {
      node.extension.sort = (lastNodeSort || 100) + 1;
    } else {
      const existExtendNode = children.findIndex((item) => hadExtendNode(item, formattedData)) > -1;
      node.extension.sort = lastNodeSort + (existExtendNode ? 1 : 100);
    }
  } else {
    node.extension.sort = ((dropIn.children?.length || 0) + 1) * 100;
  }

  return [node];
};

/**
 * after placement
 * @param node
 * @param dropIn
 * @param formattedData
 * @returns
 */
export const afterPlacement = (node: StructureNode, dropIn: StructureNode, formattedData: FormattedData) => {
  const { id: dropInId, extension } = dropIn;
  const { sort: dropInNodeSort = 0, parentId = '' } = extension || {};
  let effects: StructureNode[] = [];

  // next brothers
  const brothers = [...(findBrothers(formattedData.formattedSchemas, dropIn.id) || [])];
  const idx = brothers.findIndex((item) => item.id === node.id); // same level move
  if (idx > -1) {
    brothers.splice(idx, 1);
  }

  // get the sort
  const dropInIdx = brothers.findIndex((item) => item.id === dropIn.id);
  const dropInExtend =
    brothers.findIndex((item, _idx) => _idx > dropInIdx && hadExtendNode(item, formattedData)) > -1;
  const curNodeSort = dropInNodeSort + (dropInExtend ? 1 : 100);

  // set node attrs
  node.extension.sort = curNodeSort;
  node.extension.parentId = parentId;
  effects.push(node);

  effects = effects.concat(
    getNextEffects({ startId: dropInId, startSort: curNodeSort, next: true }, brothers, formattedData),
  );

  return effects;
};

const getPreNode = (node: StructureNode, formattedData: FormattedData) => {
  const nodeId = node.id;
  const brothers = findBrothers(formattedData.formattedSchemas, nodeId) || [];
  const idx = brothers.findIndex((item) => item.id === nodeId);
  const preNode = brothers[idx - 1];
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
  data: {
    startId: string;
    startSort: number;
    next?: boolean;
  },
  brothers: StructureNode[] = [],
  formattedData: FormattedData,
) => {
  const { startId, startSort, next } = data;
  const { extendPageNodeMap } = formattedData;
  const effects: StructureNode[] = [];
  const idx = brothers.findIndex((item) => item.id === startId);
  const nextChildren = idx > -1 ? brothers.splice(next ? idx + 1 : idx, brothers.length) : brothers;
  const nextExtendIdx = nextChildren.findIndex(
    (item) => !!item.extension.extendId || !!extendPageNodeMap[item.id],
  );
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

const hadExtendNode = (node: StructureNode, formattedData: FormattedData) => {
  return !!node.extension?.extendId || formattedData.extendPageNodeMap[node.id];
};
