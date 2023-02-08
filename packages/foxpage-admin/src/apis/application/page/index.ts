import {
  ApplicationFileListFetchParams,
  ProjectContentFetchParams,
  ProjectFileFetchResponse,
} from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export * from './version';

export const fetchApplicationPages = (params: ApplicationFileListFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/pages/file-searchs', params, (rs: ProjectFileFetchResponse) => {
      resolve(rs);
    });
  });

export const fetchApplicationPageContents = (params: ProjectContentFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/pages/content-searchs', params, (rs: ProjectFileFetchResponse) => {
      resolve(rs);
    });
  });
