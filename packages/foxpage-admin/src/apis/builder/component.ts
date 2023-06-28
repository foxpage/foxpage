import {
  ComponentFetchRes,
  ComponentVersionDetailsFetchedRes,
  ComponentVersionDetailsFetchParams,
  ComponentVersionFetchParams,
} from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const fetchLiveComponentList = (params: {
  applicationId: string;
  type: string[];
  search?: string;
}): Promise<ComponentFetchRes> =>
  new Promise((resolve) => {
    FoxPageApi.post('/components/live-version-infos', params, (rs: ComponentFetchRes) => {
      resolve(rs);
    });
  });

export const getComponentVersions = (params: ComponentVersionFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/components/version-list', params, (rs: ComponentFetchRes) => {
      resolve(rs);
    });
  });

export const getComponentVersionDetails = (params: ComponentVersionDetailsFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.post('/components/version-list-infos', params, (rs: ComponentVersionDetailsFetchedRes) => {
      resolve(rs);
    });
  });
