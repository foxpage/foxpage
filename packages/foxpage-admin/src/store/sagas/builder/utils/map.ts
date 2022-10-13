import { StructureNode } from '@/types/index';

import { pickNode } from './node';

export const mapToTree = <T extends StructureNode>(record: Record<string, T>) => {
  function dfs(list: T[], parentId?: string) {
    const result: T[] = [];

    list.forEach((item) => {
      let children = item.children || [];
      const childIds = (item.childIds || []).filter(
        (item) => children.findIndex((child) => child.id === item) === -1,
      );
      if (childIds.length > 0) {
        children = children.concat(childIds?.map((id) => record[id]).filter((it) => !!it));
      }
      let node = pickNode(item);
      const _extension = { ...node.extension };
      if (!_extension.extendId) {
        _extension.parentId = node.extension?.parentId || parentId;
      }
      node = {
        ...node,
        extension: _extension,
        children: children.length > 0 ? dfs(children as T[], node.id) : [],
      };
      result.push(node);
    });

    return result.sort((a, b) => (a.extension.sort || 0) - (b.extension.sort || 0));
  }

  const tree: T[] = dfs(
    Object.values(record).filter((item) => !record[item.extension?.parentId || '']),
    '',
  );
  return tree;
};
