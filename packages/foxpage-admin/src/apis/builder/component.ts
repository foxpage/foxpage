import { ComponentFetchRes } from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const fetchLiveComponentList = (params: {applicationId:string, type: string[], search?: string}): Promise<ComponentFetchRes> =>
  new Promise((resolve) => {
    FoxPageApi.post('/components/live-version-infos', params, (rs: ComponentFetchRes) => {
      resolve(rs);
    });
  });
