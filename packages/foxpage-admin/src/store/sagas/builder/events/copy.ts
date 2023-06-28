import { BLANK_NODE } from '@/constants/build';
import { FormattedData, StructureNode } from '@/types/index';

import { findStructureById, generateStructureId, getStyleWrapper, isTPLNode } from '../utils';

import { afterPlacement } from './drop';

type CopyOptions = {
  formattedData: FormattedData;
};

/**
 * copy structure
 * if had children, will dfs to copy too
 * @param list need to copy component
 * @param opt copy options
 * @returns copied
 */
export const copyComponents = <T extends StructureNode>(list: T[] = [], opt: CopyOptions) => {
  const { formattedData } = opt;
  let effects: T[] = [];

  const mapper = (item: T) => {
    const result = copy([item], { parentId: item.extension.parentId || '' })[0];
    if (result) {
      const placementEffects = afterPlacement(result, item, formattedData);
      effects = effects.concat(placementEffects as T[]);
    }
  };

  list.forEach((item) => {
    let styleContainer = getStyleWrapper(item, formattedData);
    if (styleContainer) {
      styleContainer = findStructureById(formattedData.formattedSchemas, styleContainer.id);
    }
    mapper((styleContainer || item) as T);
  });
  return effects;
};

const copy = <T extends StructureNode>(data: T[] = [], opt: { parentId: string }) => {
  const list: T[] = [];
  data.forEach((node: T) => {
    if (node.name !== BLANK_NODE) {
      const id = generateStructureId();
      const extension = { ...(node.extension || {}), ...{ parentId: opt.parentId } };
      const item = { ...node, id, extension, children: [] } as T;
      // delete extendId
      delete item.extension?.extendId;

      if (!isTPLNode(node) && node.children) {
        item.children = copy(node.children, { parentId: id });
        // TODO:
        item.childIds = item.children.map((item) => item.id);
      }

      list.push(item);
    }
  });

  return list;
};
