import _ from 'lodash';

import { generateNodeId } from '@/services/builder';
import { ComponentStructure, DslContent, ExtensionData } from '@/types/builder';

const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * object diff
 * @param base
 * @param current
 * @returns
 */
export const objectDiff = <T extends Record<string, any>>(base: T, current: T) => {
  const result = {} as T;
  for (const key in current) {
    if (hasOwnProperty.call(current, key)) {
      const baseValue = base[key];
      const curValue = current[key];

      if (hasOwnProperty.call(base, key) && _.isObject(baseValue) && _.isObject(curValue)) {
        if (!_.isArray(baseValue) && !_.isArray(curValue)) {
          const diffed = objectDiff(baseValue, curValue);
          if (diffed !== undefined) {
            result[key] = result[key];
          }
        } else {
          result[key] = curValue;
        }
      } else {
        // only the "null" or "" is valid empty value
        if ((curValue || curValue === null || curValue === '') && baseValue !== curValue) {
          result[key] = curValue;
        }
      }
    }
  }

  if (_.isEmpty(result)) {
    return undefined;
  }
  return result;
};

/**
 * structure node diff
 * @param base
 * @param current
 * @returns
 */
export const nodeDiff = <T extends ComponentStructure>(base: T, current: T) => {
  const {
    label: baseLabel,
    name: baseName,
    props: baseProps = {},
    directive: baseDirective = {},
    extension: baseExtension = {},
  } = base;
  const {
    label: currentLabel,
    name: currentName,
    props: currentProps = {},
    directive: currentDirective = {},
    extension: currentExtension = {},
  } = current;

  // if diff is empty, will set default {}
  const props = objectDiff(baseProps, currentProps);
  const directive = objectDiff(baseDirective, currentDirective);
  let extension = objectDiff(baseExtension, currentExtension);

  if (props || directive || baseLabel !== currentLabel || baseName !== currentName) {
    // bind extend info
    if (!extension) {
      extension = {};
    }
    if (!extension.extendId) {
      extension.extendId = current.id;
    }

    return {
      id: generateNodeId(),
      name: currentName,
      label: currentLabel,
      type: current.type,
      props: props || {},
      directive: directive || {},
      extension: extension || {},
    } as T;
  }

  return null;
};

type DiffComponentStructure = ComponentStructure & { childIds: string[] };
const treeToRecord = <T extends DiffComponentStructure, P extends DslContent['schemas']>(base: P) => {
  const record: Record<string, T> = {};
  function dfs(tree: P) {
    tree.forEach((item) => {
      record[item.id] = ({
        ...item,
        children: [],
        childIds: item.children?.map((item) => item.id),
      } as unknown) as T;
      if (item.children?.length) {
        dfs(item.children as P);
      }
    });
  }
  dfs(base);
  return record;
};

const recordToTree = <T extends DiffComponentStructure>(record: Record<string, T>) => {
  function dfs(list: T[]) {
    list.forEach((item) => {
      const childIds = item.childIds || [];
      if (childIds.length > 0) {
        const children = childIds?.map((id) => record[id]).filter((it) => !!it);

        item.children = children.length > 0 ? dfs(children) : [];
      }
      // avoid the extension data
      // @ts-ignore
      delete item.childIds;
    });
    return list;
  }

  const tree: T[] = dfs(Object.values(record).filter((item) => !record[item.extension?.parentId || '']));
  return tree;
};

/**
 * schema diff
 * @param base
 * @param current
 * @returns
 */
export const schemaDiff = <T extends DslContent['schemas']>(base: T, current: T) => {
  const baseRecord: Record<string, DiffComponentStructure> = treeToRecord(base);
  const currentRecord: Record<string, DiffComponentStructure> = treeToRecord(current);
  const result: Record<string, DiffComponentStructure> = {};

  Object.values(currentRecord).forEach((item) => {
    const baseItem = baseRecord[item.id] || baseRecord[item.extension?.extendId || ''];
    if (baseItem) {
      const diffed = nodeDiff(baseItem, item);
      if (diffed) {
        result[item.id] = diffed;
      }
    } else {
      result[item.id] = item;
    }
  });

  const schemas = recordToTree(result);
  return schemas;
};

/**
 * relation diff
 * @param base
 * @param current
 * @returns
 */
export const relationDiff = <T extends DslContent['relation']>(base: T, current: T) => {
  return objectDiff(base, current) || {};
};

/**
 * dsl diff
 * Because inserting the inheritance function midway is very cumbersome and prone to problems, the inheritance function is implemented through dsl diff.
 * Even if the inheritance function is added, the original operation remains unchanged. In the end, only the content of the subclass can be generated, so it is realized by dsl diff.
 * @param baseContent base(parent) content
 * @param current current content
 * @returns differed
 */
export const differ = (extension: ExtensionData, current: DslContent) => {
  const { baseContent } = extension;

  if (baseContent && baseContent.length > 0) {
    const { content } = baseContent[0];
    const diffed = {
      ...current,
      schemas: schemaDiff(content.schemas || [], current.schemas),
      relation: relationDiff(content.relation || {}, current.relation),
    } as DslContent;
    return diffed;
  }

  return current;
};
