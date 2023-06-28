import { createAction } from 'typesafe-actions';

import { RecordActionType } from '@/constants/index';
import {
  RecordFetchEdRes,
  RecordFetchParams,
  RecordLog,
  RecordSaveParams,
  RecordStatus,
} from '@/types/index';

export const clearAll = createAction('RECORD__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction('RECORD__UPDATE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const addUserRecords = createAction(
  'RECORD__ADD_USER_RECORD',
  (
    action: RecordActionType,
    details: any[],
    opt?: { save?: boolean; applicationId?: string; contentId?: string },
  ) => ({
    action,
    details,
    opt,
  }),
)();

export const pushLocalRecords = createAction('RECORD__PUSH_LOCAL_RECORD', (data: RecordLog[]) => ({
  data,
}))();

export const updateLocalRecords = createAction('RECORD__UPDATE_LOCAL_RECORD', (data: RecordLog[]) => ({
  data,
}))();

export const updateRemoteRecords = createAction('RECORD__UPDATE_REMOTE_RECORD', (index: number, record: RecordLog) => ({
  index,
  record,
}))();

export const updateNodeUpdateRecords = createAction('RECORD__UPDATE_NODE_UPDATE_RECORDS', (data: RecordLog[]) => ({
  data,
}))();

export const updateNodeUpdateRecordsIndex = createAction('RECORD__UPDATE_NODE_UPDATE_RECORDS_INDEX', (index: number) => ({
  index,
}))();

export const clearLocalRecord = createAction('RECORD__CLEAR_LOCAL_RECORD', () => ({}))();

export const saveUserRecords = createAction('RECORD__SAVE_USER_RECORD', (params: RecordSaveParams) => ({
  params,
}))();

export const fetchUserRecords = createAction('RECORD__GET_USER_RECORD', (params: RecordFetchParams) => ({
  params,
}))();

export const pushUserRecords = createAction('RECORD__PUSH_USER_RECORD', (data: RecordFetchEdRes) => ({
  data,
}))();

export const updatePageNum = createAction('RECORD__UPDATE_PAGE_NUM', (num: number) => ({
  num,
}))();

export const fetchUserRecordStatus = createAction(
  'RECORD__GET_USER_RECORD_STATUS',
  (params: RecordFetchParams) => ({
    params,
  }),
)();

export const pushUserRecordStatus = createAction('RECORD__PUSH_USER_RECORD_STATUS', (data: RecordStatus) => ({
  data,
}))();

export const updateStructureStatus = createAction('RECORD__UPDATE_STRUCTURE_STATUS', (key: string) => ({
  key,
}))();
