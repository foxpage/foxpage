import { StructureNode } from '@/types/index';

/**
 * structure to map
 * @param structures
 * @returns
 */
export const structureToNodeMap = (structures: StructureNode[]) => {
  const map: Record<string, StructureNode> = {};

  function dfs(list: StructureNode[] = []) {
    list.forEach((item) => {
      if (item) {
        let childIds: string[] = [];
        if (item.children) {
          dfs(item.children);
          childIds = item.children.map((item) => item.id);
        }
        map[item.id] = { ...item, children: [], childIds };
      }
    });
  }

  dfs(structures);

  return map;
};

/**
 * structure to list
 * @param structures
 * @returns
 */
export const structureToList = (structures: StructureNode[]) => {
  const result: StructureNode[] = [];

  function dfs(list: StructureNode[] = []) {
    list.forEach((item) => {
      if (item) {
        if (item.children) {
          dfs(item.children);
          item.childIds = item.children.map((item) => item.id);
        }
        result.push({ ...item, children: [] });
      }
    });
  }

  dfs(structures);

  return result;
};

// finders
const createSelector =
  <K extends keyof StructureNode>(key: K, val: StructureNode[K]) =>
  (structure?: StructureNode) => {
    return structure && structure[key] === val;
  };

export const findStructure = (
  list: StructureNode[] = [],
  selector: (structure?: StructureNode<any> | undefined) => boolean | undefined,
  opt?: {
    returnBrother?: boolean;
  },
): StructureNode | StructureNode[] | null => {
  for (let idx = 0; idx < list.length; idx++) {
    const node = list[idx];
    if (selector(node)) {
      return opt?.returnBrother ? list : node;
    }
    if (node.children?.length) {
      const result = findStructure(node.children, selector, opt);
      if (result) {
        return result;
      }
    }
  }
  return null;
};

export const findStructureByName = (structure: StructureNode[], value: string) => {
  const selector = createSelector('name', value);
  return findStructure(structure, selector) as StructureNode | null;
};

export const findStructureById = (structure: StructureNode[], value: string) => {
  const selector = createSelector('id', value);
  return findStructure(structure, selector) as StructureNode | null;
};

export const findStructureByExtendId = (dsl: StructureNode[], value: string) => {
  return findStructure(dsl, (node) => {
    return node?.extension?.extendId === value;
  }) as StructureNode | null;
};

export const findBrothers = (dsl: StructureNode[], value: string) => {
  return findStructure(dsl, (node) => node?.id === value, { returnBrother: true }) as StructureNode[] | null;
};

export const findBrothersByParentId = (dsl: StructureNode[], value: string) => {
  return findStructure(dsl, (node) => node?.extension && node?.extension?.parentId === value, {
    returnBrother: true,
  }) as StructureNode[] | null;
};

// filter removed
export const removeStructure = <T extends StructureNode>(structure: T[] = [], removeId: string): T[] => {
  return structure
    .filter((item) => item.id !== removeId)
    .map((item) => {
      if (item.children) {
        const children = removeStructure(item.children, removeId);
        const childIds = children.map((child) => child.id);
        return { ...item, children, childIds };
      }
      return item;
    });
};

/**
 * get selected node
 * @param structure
 * @param selectedNodeId
 * @returns
 */
export const getSelectedNode = (structure: StructureNode[], selectedNodeId: string) => {
  // get real selected node in render structure
  let _selectedNode: StructureNode | undefined;
  if (selectedNodeId) {
    _selectedNode = findStructureById(structure, selectedNodeId) as StructureNode;
    if (!_selectedNode) {
      _selectedNode = findStructureByExtendId(structure, selectedNodeId) as StructureNode;
    }
  }
  return _selectedNode;
};
