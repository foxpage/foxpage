import {
  ApplicationFileListFetchParams,
  ProjectContentFetchParams,
  ProjectFileFetchResponse,
} from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const fetchApplicationTemplates = (params: ApplicationFileListFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/templates/file-searchs', params, (rs: ProjectFileFetchResponse) => {
      resolve(rs);
    });
  });

export const fetchApplicationTemplateContents = (params: ProjectContentFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/templates/content-searchs', params, (rs: ProjectFileFetchResponse) => {
      resolve(rs);
    });
  });
