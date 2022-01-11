import { FileDetailFetchParams } from '@/types/application/file';
import { ProjectFileDeleteReqParams, ResponseBody } from '@/types/index';
import { ProjectFileDetailFetchResponse } from '@/types/project/file';
import FoxpageApi from '@/utils/foxpage-api-sdk';

export const deleteFile = (params: ProjectFileDeleteReqParams) =>
  new Promise(resolve => {
    FoxpageApi.put('/file/delete', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const fetchFileDetail = (params: FileDetailFetchParams) =>
  new Promise(resolve => {
    FoxpageApi.post('/files', params, (rs: ProjectFileDetailFetchResponse) => {
      resolve(rs);
    });
  });
