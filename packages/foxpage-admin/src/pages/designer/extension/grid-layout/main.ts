import { Component, DndData, RenderStructure, RenderStructureNode } from '@/types/index';

import { getSelectedNode } from '@/store/sagas/builder/utils';

import { findStructureById, getFrameDoc } from '../../utils';

// TODO: for config
const GRID_CONTAINER = '@fox-design/react-grid-container';
const GRID_PANEL = '@fox-design/react-grid-panel';
const GRID_COLUMNS = 12;
let dragLine: 'left' | 'right' | null = null; // left | right

export const setDragLine = (value: 'left' | 'right' | null) => {
  dragLine = value;
};

export const isGridContainer = (selectNode?: RenderStructureNode | null) => {
  return selectNode?.name === GRID_CONTAINER;
};

export const isGridPanel = (selectNode?: RenderStructureNode | null) => {
  return selectNode?.name === GRID_PANEL;
};

/**
 * get drag status
 * @param structure
 * @param selectNode
 * @returns
 */
export const getDragStatus = (structure: RenderStructure, selectNode?: RenderStructureNode | null) => {
  if (!selectNode || !isGridPanel(selectNode)) {
    return;
  }
  const parentNode = findStructureById(structure, selectNode.extension?.parentId || '');
  if (!parentNode) {
    return;
  }
  const selectNodeIdx = parentNode.children?.findIndex((item) => item.id === selectNode.id) || 0;
  const columns = parentNode.props.columns || ''; // grid columns
  const columnList = columns.split(':') as string[]; // [3,9,12]
  const childLength = columns.length || 0;
  const curColumn = Number(columnList[selectNodeIdx] || GRID_COLUMNS); // 12
  const preColumn = selectNodeIdx > 0 ? Number(columnList[selectNodeIdx - 1] || GRID_COLUMNS) : GRID_COLUMNS; // 12
  const _list = columnList.slice(0, selectNodeIdx).map((item) => Number(item || 0));
  const preColumnTotal =
    _list.length > 0
      ? _list.reduce((acr, cur) => {
          return acr + cur;
        })
      : 0;
  const left =
    selectNodeIdx > 0 &&
    curColumn < GRID_COLUMNS &&
    preColumnTotal % GRID_COLUMNS !== 0 &&
    preColumn <= GRID_COLUMNS &&
    (preColumnTotal % GRID_COLUMNS) + curColumn <= 12;
  const right =
    selectNodeIdx + 1 <= childLength &&
    curColumn < GRID_COLUMNS &&
    (preColumnTotal + curColumn) % GRID_COLUMNS !== 0;

  return {
    left,
    right,
  };
};

/**
 * get columns group
 *
 * => [12,2,4,3,3,6,6,9,3]
 * => [[12],[2,4,3,3],[6,6],[9,3]]
 * @param columns
 * @returns
 */
export const getGridColumnsGroups = (columns: number[]) => {
  let group = [] as number[][];
  let columnTotal = 0;

  for (let i = 0; i < columns.length; i++) {
    const curColumn = Number(columns[i]);
    if (columnTotal < GRID_COLUMNS) {
      columnTotal = columnTotal + curColumn;
      if (columnTotal <= GRID_COLUMNS) {
        if (group.length === 0) {
          group = [[]];
        }
        group[group.length - 1].push(curColumn);
      } else {
        columnTotal = curColumn;
        group.push([curColumn]);
      }
    } else {
      columnTotal = curColumn;
      group.push([curColumn]);
    }
  }

  return group;
};

/**
 * get cur columns group
 *
 * curIdx: 7(9)
 * => [12,2,4,3,3,6,6,9,3]
 * => [[12],[2,4,3,3],[6,6],[9,3]]
 * => [9,3]
 * @param columns
 * @param curIdx
 * @returns
 */
export const getCurColumnGroup = (columns: number[], curIdx: number) => {
  let preCount = 0;
  let curGroup: number[] = [];
  let groupIdx = 0;

  const groups = getGridColumnsGroups(columns);
  for (let i = 0; i < groups.length; i++) {
    const curGroupLength = groups[i].length;
    if (curIdx > preCount && curIdx <= preCount + curGroupLength) {
      curGroup = groups[i];
      groupIdx = curIdx - preCount;
      break;
    } else {
      preCount = preCount + curGroupLength;
    }
  }

  return {
    groups,
    curGroup,
    groupIdx: groupIdx > 0 ? groupIdx - 1 : 0,
  };
};

const getGridColumns = (columns: string) => {
  return (columns || '').split(':').map((item) => Number(item || 0)) as number[];
};

/**
 * get drag data in grid
 * @param renderDSL
 * @param selectNode
 * @returns
 */
export const getGridDragData = (renderDSL: RenderStructure, selectNode?: RenderStructureNode | null) => {
  let gridData = {};
  const { id: selectNodeId = '' } = selectNode || {};
  const parentNode = selectNode ? findStructureById(renderDSL, selectNode.extension.parentId || '') : null;
  if (parentNode) {
    const frameDoc = getFrameDoc();
    if (frameDoc) {
      const curIdx = parentNode.children?.findIndex((item) => item.id === selectNodeId) || 0;
      // columns group
      const columns = getGridColumns(parentNode.props.columns);
      const { groups, curGroup, groupIdx } = getCurColumnGroup(columns, curIdx + 1);

      gridData = {
        containerRect: frameDoc.getElementById(parentNode.id)?.getBoundingClientRect() || {},
        selectNodeRect: frameDoc.getElementById(selectNodeId)?.getBoundingClientRect() || {},
        selectNodeIdx: curIdx,
        columns,
        groups,
        curGroup,
        groupIdx,
      };
    }
  }
  console.log('getGridDataOfDrag:', gridData);
  return gridData;
};

/**
 * get drag over status
 * @param e
 * @param gridData
 */
export const getDragOverStatus = (e: any, gridData: any) => {
  const { clientX } = e;
  const { containerRect, columns, selectNodeIdx = 0, curGroup = [], groupIdx = 0 } = gridData;
  const colWidth = containerRect.width / GRID_COLUMNS;
  const moveInIdx = Math.ceil(clientX / colWidth);
  const curCol = curGroup[groupIdx];
  const result = columns.concat([]) as number[];

  // drag line
  if (dragLine === 'left') {
    const preColTotal = getPreColTotal(curGroup as number[], (groupIdx - 1) as number);
    const diff = moveInIdx - preColTotal;
    const preCol = curGroup[groupIdx - 1];
    const newCol = curCol - diff;
    const newPreCol = preCol + diff;
    if (newCol > 0 && newPreCol > 0) {
      result.splice(selectNodeIdx, 1, newCol);
      result.splice(selectNodeIdx - 1, 1, newPreCol);
    } else {
      // min value:1
      if (newCol < 1) {
        result.splice(selectNodeIdx, 1, 1);
        result.splice(selectNodeIdx - 1, 1, preCol + curCol - 1);
      }
      if (newPreCol < 1) {
        result.splice(selectNodeIdx, 1, preCol + curCol - 1);
        result.splice(selectNodeIdx - 1, 1, 1);
      }
    }
  } else if (dragLine === 'right') {
    const preColTotal = getPreColTotal(curGroup as number[], groupIdx as number);
    const diff = moveInIdx - preColTotal;
    const nextCol = curGroup[groupIdx + 1];
    const newCol = curCol + diff;
    const newNextCol = nextCol - diff;
    if (newCol > 0 && newNextCol > 0) {
      result.splice(selectNodeIdx, 1, newCol);
      result.splice(selectNodeIdx + 1, 1, newNextCol);
    } else {
      // min value:1
      if (newCol < 1) {
        result.splice(selectNodeIdx, 1, 1);
        result.splice(selectNodeIdx + 1, 1, nextCol + curCol - 1);
      }
      if (newNextCol < 1) {
        result.splice(selectNodeIdx, 1, nextCol + curCol - 1);
        result.splice(selectNodeIdx + 1, 1, 1);
      }
    }
  }

  console.log('getDragOverStatus:', result);
  return result.join(':');
};

const getPreColTotal = (columns: number[], curIdx: number) => {
  let total = 0;
  columns.forEach((item, idx) => {
    if (idx <= curIdx) {
      total = total + item;
    }
  });
  return total;
};

/**
 * grid container column changed
 * @param node
 * @param oldNode
 * @returns
 */
export const gridContainerUpdateHandler = (
  node: RenderStructureNode,
  oldNode: RenderStructureNode,
  opt: { structure: RenderStructure; components: Component[] },
) => {
  const columnsCount = (node.props?.columns || '').split(':').length;
  const selectedNode = getSelectedNode(opt.structure, oldNode.id) as RenderStructureNode;
  const oldColumnsCount = selectedNode?.children?.length || 0;

  const adds: DndData[] = [];
  let removes: RenderStructureNode[] = [];
  if (columnsCount < oldColumnsCount) {
    // remove panel
    const diff = oldColumnsCount - columnsCount;
    const children = (selectedNode?.children || []).concat([]);
    removes = children.splice(-diff);
  } else if (columnsCount > oldColumnsCount) {
    // add panel
    const diff = columnsCount - oldColumnsCount;
    const panelComponent = opt.components.find((item) => item.name === GRID_PANEL);
    if (panelComponent) {
      let idx = 0;
      while (idx < diff) {
        adds.push({
          placement: 'in',
          dropIn: node,
          dragInfo: {
            type: 'add',
            detail: panelComponent,
          },
        });
        idx = idx + 1;
      }
    }
  }

  console.log('gridContainerUpdate', { updates: [], adds, removes });
  return { updates: [], adds, removes };
};

// export const initGridPanel = (count:number, components: Component[]) => {

// }

/**
 * grid panel add
 * @param node
 */
export const gridPanelAddHandler = (
  node: RenderStructureNode,
  opt: { structure: RenderStructure; components: Component[] },
) => {
  const parentId = node.extension.parentId || '';
  const parentNode = findStructureById(opt.structure, parentId);
  if (!parentNode) {
    return { adds: [], updates: [], removes: [] };
  }
  // container column
  let newColumns = parentNode.props.columns || '';
  if (newColumns) {
    newColumns = newColumns + ':' + GRID_COLUMNS;
  }
  const update = Object.assign({}, parentNode, { props: { ...parentNode.props, columns: newColumns } });
  // console.log('gridPanelAdd', { adds: [node], updates: [update], removes: [] });
  return { adds: [], updates: [update], removes: [] };
};

/**
 * grid panel remove
 * @param node
 */
export const gridPanelRemoveHandler = (
  node: RenderStructureNode,
  opt: { structure: RenderStructure; components: Component[] },
) => {
  const parentId = node.extension.parentId || '';
  const parentNode = findStructureById(opt.structure, parentId);
  if (!parentNode) {
    return { adds: [], updates: [], removes: [] };
  }
  const curNodeIdx = parentNode.children?.findIndex((item) => item.id === node.id) || 0;
  const columnStr = parentNode.props.columns || '';
  const columns = getGridColumns(columnStr);
  const { curGroup, groupIdx } = getCurColumnGroup(columns, curNodeIdx + 1);
  const newColumns = columns.concat([]) as number[];

  if (curGroup.length > 1) {
    if (groupIdx > 0) {
      // pre col will to big
      newColumns.splice(curNodeIdx - 1, 1, columns[curNodeIdx - 1] + columns[curNodeIdx]);
      newColumns.splice(curNodeIdx, 1);
    } else {
      // next col will to big
      newColumns.splice(curNodeIdx + 1, 1, columns[curNodeIdx + 1] + columns[curNodeIdx]);
      newColumns.splice(curNodeIdx, 1);
    }
  } else if (curGroup.length === 1) {
    // row only one panel, will be remove
    newColumns.splice(curNodeIdx, 1);
  }

  const newColumnStr = newColumns.join(':');
  const updates =
    newColumnStr !== columnStr
      ? [Object.assign({}, parentNode, { props: { ...parentNode.props, columns: newColumnStr } })]
      : [];

  // console.log('gridPanelRemove', { adds: [], updates, removes: [node] });
  return { adds: [], updates, removes: [] };
};
