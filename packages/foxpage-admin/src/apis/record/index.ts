import { RecordFetchEdRes, RecordFetchParams, RecordSaveParams, ResponseBody } from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const addRecords = (params: RecordSaveParams) =>
  new Promise((resolve) => {
    FoxPageApi.post('/contents/logs', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const fetchRecords = (params: RecordFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/contents/logs', params, (rs: RecordFetchEdRes) => {
      resolve(rs);
    });
  });

export const fetchRecordStatus = (params: RecordFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/contents/change-item-logs', params, (rs: RecordFetchEdRes) => {
      resolve(rs);
    });
  });

export const fetchDeleteRecords = (params: RecordFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/contents/delete-logs', params, (rs: RecordFetchEdRes) => {
      resolve(rs);
    });
  });
