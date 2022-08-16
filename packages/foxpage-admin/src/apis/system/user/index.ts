import {
  AddOrganizationUserParams,
  CommonFetchParams,
  DeleteOrganizationUserParams,
  OrganizationUserFetchResponse,
  ResponseBody,
} from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const fetchOrganizationList = (): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.get('/organizations/by-user', {}, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const fetchOrganizationUsers = (params: CommonFetchParams): Promise<OrganizationUserFetchResponse> =>
  new Promise((resolve) => {
    FoxPageApi.get('/organizations/member-searchs', params, (rs: OrganizationUserFetchResponse) => {
      resolve(rs);
    });
  });

export const addOrganizationUser = (params: AddOrganizationUserParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.post('/organizations/members', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const deleteOrganizationUser = (params: DeleteOrganizationUserParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.put('/organizations/members-status', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });
