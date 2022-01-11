import { ContentDeleteParams, ContentSearchParams, ContentType } from '@/types/application/content';
import { FileResponse, FileSearchParams, FileType, FileUpdateReqParams } from '@/types/application/file';
import { BaseResponse } from '@/types/common';
import FoxpageApi from '@/utils/foxpage-api-sdk';

export const getApplicationPages = (params: FileSearchParams) =>
  new Promise(resolve => {
    FoxpageApi.get('/pages/file-searchs', params, (rs: FileResponse) => {
      resolve(rs);
    });
  });

export const deletePages = (params: { applicationId: string; id: string; status: boolean }) =>
  new Promise(resolve => {
    FoxpageApi.put('/pages/status', params, (rs: BaseResponse<FileType>) => {
      resolve(rs);
    });
  });

export const updatePage = (params: FileUpdateReqParams) =>
  new Promise(resolve => {
    FoxpageApi.put('/pages', params, (rs: BaseResponse<FileType>) => {
      resolve(rs);
    });
  });

export const getPageContents = (params: ContentSearchParams) =>
  new Promise(resolve => {
    FoxpageApi.get('/pages/content-searchs', params, (rs: FileResponse) => {
      resolve(rs);
    });
  });

export const deletePageContent = (params: ContentDeleteParams) =>
  new Promise(resolve => {
    FoxpageApi.put('/pages/content-status', params, (rs: FileResponse) => {
      resolve(rs);
    });
  });

export const updatePageContent = (params: ContentType) =>
  new Promise(resolve => {
    FoxpageApi.put('/pages/contents', params, (rs: FileResponse) => {
      resolve(rs);
    });
  });
