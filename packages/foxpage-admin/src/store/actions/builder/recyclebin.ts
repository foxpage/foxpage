import { createAction } from 'typesafe-actions';

import { RecordFetchParams, RecordLog, RenderStructureNode, StructureNode } from '@/types/index';

export const fetchList = createAction('RECYCLE_BIN__FETCH_LIST', (params: RecordFetchParams) => ({
  params,
}))();

export const setList = createAction('RECYCLE_BIN__SET_LIST', (list: RecordLog[], total: number, remote?: boolean) => ({
  list,
  total,
  remote,
}))();

export const pushBackNodes = createAction('RECYCLE_BIN__PUSH_BACK_NODES', (nodes: StructureNode[]) => ({
  nodes,
}))();

export const addNodes = createAction('RECYCLE_BIN__ADD_NODES', (nodes: RecordLog[], remote?: boolean) => ({
  nodes,
  remote,
}))();

export const removeNode = createAction('RECYCLE_BIN__REMOVE_NODE', (index: number, remote?: boolean) => ({
  index,
  remote,
}))();

export const doDelete = createAction('RECYCLE_BIN__DELETE_NODES', (nodes: RenderStructureNode[]) => ({
  nodes,
}))();

export const diffRecords = createAction('RECYCLE_BIN__DIFF_RECORDS', () => ({}))();
