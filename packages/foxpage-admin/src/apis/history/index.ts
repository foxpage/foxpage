import {
  ContentVersionRes,
  ContentVersionsParams,
  HistoryFetchEdRes,
  HistoryFetchParams,
} from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const fetchHistory = (params: HistoryFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/contents/version-logs', params, (rs: HistoryFetchEdRes) => {
      resolve(rs);
    });
  });

export const getAllContentVersions = (params: ContentVersionsParams) => {
  return new Promise((resolve) => {
    FoxPageApi.get('/content/versions', params, (rs: ContentVersionRes) => {
      resolve(rs);
    });
  });
};
