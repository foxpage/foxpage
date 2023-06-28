import { NoticeFetchedResponse } from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const fetchNotices = (params: {}): Promise<NoticeFetchedResponse> =>
  new Promise((resolve) => {
    FoxPageApi.get('/notices', params, (rs: NoticeFetchedResponse) => {
      resolve(rs);
    });
  });
