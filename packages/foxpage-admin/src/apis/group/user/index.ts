import {
  AddOrganizationUserParams,
  DeleteOrganizationUserParams,
  OrganizationUserFetchResponse,
  OrganizationUserSearchParams,
  ResponseBody,
} from '@/types/index';
import FoxpageApi from '@/utils/foxpage-api-sdk';

export const fetchOrganizationUsers = (params: OrganizationUserSearchParams): Promise<OrganizationUserFetchResponse> =>
  new Promise(resolve => {
    FoxpageApi.get('/organizations/member-searchs', params, (rs: OrganizationUserFetchResponse) => {
      resolve(rs);
    });
  });

export const addOrganizationUser = (params: AddOrganizationUserParams): Promise<ResponseBody> =>
  new Promise(resolve => {
    FoxpageApi.post('/organizations/members', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const deleteOrganizationUser = (params: DeleteOrganizationUserParams): Promise<ResponseBody> =>
  new Promise(resolve => {
    FoxpageApi.put('/organizations/members-status', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });
