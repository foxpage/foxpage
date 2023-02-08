import {
  ContentVersionDataFetchedRes,
  ContentVersionDataFetchParams,
  ContentVersionDetailFetchParams,
  PageContent,
} from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

// version list
export const fetchPageVersions = (params: ContentVersionDataFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/pages/versions', params, (rs: ContentVersionDataFetchedRes) => {
      resolve(rs);
    });
  });

export const fetchTemplateVersions = (params: ContentVersionDataFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/templates/versions', params, (rs: ContentVersionDataFetchedRes) => {
      resolve(rs);
    });
  });

export const fetchBlockVersions = (params: ContentVersionDataFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/blocks/versions', params, (rs: ContentVersionDataFetchedRes) => {
      resolve(rs);
    });
  });

// version detail
export const fetchPageVersionDetail = (params: ContentVersionDetailFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/pages/version', params, (rs: PageContent) => {
      resolve(rs);
    });
  });

export const fetchTemplateVersionDetail = (params: ContentVersionDetailFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/templates/version', params, (rs: PageContent) => {
      resolve(rs);
    });
  });

export const fetchBlockVersionDetail = (params: ContentVersionDetailFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/blocks/version', params, (rs: PageContent) => {
      resolve(rs);
    });
  });
