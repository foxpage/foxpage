import { FoxpageComponentType } from '@foxpage/foxpage-js-sdk';
import { FoxpageComponent, FoxpageComponentMeta } from '@foxpage/foxpage-types';

import { Component, RenderStructureNode } from '@/types/index';

type LoadedComponentMap = Record<string, FoxpageComponentType>;

const createSelector =
  <K extends keyof FoxpageComponentMeta>(key: K, val: FoxpageComponentMeta[K]) =>
  (structure?: FoxpageComponentMeta) => {
    return structure && structure[key] === val;
  };

export const findStructureByName = (dsl: RenderStructureNode[], value: string) => {
  const selector = createSelector('name', value);
  return findStructure(dsl, selector);
};

export const findStructureById = (dsl: RenderStructureNode[], value: string) => {
  const selector = createSelector('id', value);
  return findStructure(dsl, selector);
};

export const findStructure = (
  list: RenderStructureNode[],
  selector: (structure?: RenderStructureNode | undefined) => boolean | undefined,
): RenderStructureNode | null => {
  for (let idx = 0; idx < list.length; idx++) {
    const node = list[idx];
    if (selector(node)) {
      return node;
    }
    if (node.children?.length) {
      const result = findStructure(node.children, selector);
      if (result) {
        return result;
      }
    }
  }
  return null;
};

/**
 * find structure by meta info
 *
 * @export
 * @param {LoadedComponentMap} componentMap
 * @param {('isHead' | 'isBody')} tag
 * @return {*}
 */
export function findStructureByMeta(
  dsl: RenderStructureNode[] = [],
  componentMap: LoadedComponentMap,
  tag: keyof FoxpageComponentMeta,
) {
  return findStructure(dsl, (item) => {
    if (item) {
      const component = componentMap[item.name];
      if (component) {
        // useStyledComponents: the meta of package provide
        return !!(component as unknown as FoxpageComponent).meta[tag];
      }
    }
    return false;
  });
}

export function findHtml(dsl: RenderStructureNode[], componentMap: LoadedComponentMap) {
  return findStructureByMeta(dsl, componentMap, 'isHtml');
}

export function findBody(dsl: RenderStructureNode[], componentMap: LoadedComponentMap) {
  return findStructureByMeta(dsl, componentMap, 'isBody');
}

export function findHead(dsl: RenderStructureNode[], componentMap: LoadedComponentMap) {
  return findStructureByMeta(dsl, componentMap, 'isHead');
}

export function findHeadAndBody(dsl: RenderStructureNode[], allComponents: Component[] = []) {
  const componentMap = {};
  allComponents.forEach((item) => {
    componentMap[item.name || ''] = item;
  });
  const html = findHtml(dsl, componentMap);
  const head = findHead(dsl, componentMap);
  const body = findBody(dsl, componentMap);
  return { html, head, body };
}

export function treeToList(nodes: RenderStructureNode[] = [], list: RenderStructureNode[] = []) {
  nodes.forEach((item) => {
    list.push(item);
    if (item.children && item.children?.length > 0) {
      treeToList(item.children, list);
    }
  });
}
