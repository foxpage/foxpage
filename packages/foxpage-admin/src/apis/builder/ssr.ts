import { PreviewResponse, PreviewResultFetchParams } from '@/types/builder/ssr';
import SSRApi from '@/utils/ssr-api-sdk';

export const fetchRenderHtml = (params: PreviewResultFetchParams) =>
  new Promise(resolve => {
    SSRApi.post('/pages/renderToHtml?preview=1', params, (rs: PreviewResponse) => {
      resolve(rs);
    });
  });
