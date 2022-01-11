import { ContentDeleteParams, ContentSearchParams, ContentType } from '@/types/application/content';
import { FileResponse, FileSearchParams, FileUpdateReqParams } from '@/types/application/file';
import FoxpageApi from '@/utils/foxpage-api-sdk';

export const getApplicationTemplates = (params: FileSearchParams) =>
  new Promise(resolve => {
    FoxpageApi.get('/templates/file-searchs', params, (rs: FileResponse) => {
      resolve(rs);
    });
  });

export const deleteTemplate = (params: { applicationId: string; id: string; status: boolean }) =>
  new Promise(resolve => {
    FoxpageApi.put('/templates/status', params, rs => {
      resolve(rs);
    });
  });

export const updateTemplate = (params: FileUpdateReqParams) =>
  new Promise(resolve => {
    FoxpageApi.put('/templates', params, rs => {
      resolve(rs);
    });
  });

export const getTemplateContents = (params: ContentSearchParams) =>
  new Promise(resolve => {
    FoxpageApi.get('/templates/content-searchs', params, (rs: FileResponse) => {
      resolve(rs);
    });
  });

export const deleteTemplateContent = (params: ContentDeleteParams) =>
  new Promise(resolve => {
    FoxpageApi.put('/templates/content-status', params, (rs: FileResponse) => {
      resolve(rs);
    });
  });

export const updateTemplateContent = (params: ContentType) =>
  new Promise(resolve => {
    FoxpageApi.put('/templates/contents', params, (rs: FileResponse) => {
      resolve(rs);
    });
  });
