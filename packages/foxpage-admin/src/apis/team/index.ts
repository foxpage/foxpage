import {
  ResponseBody,
  TeamAddParams,
  TeamDeleteParams,
  TeamMembersFetchParams,
  TeamMembersUpdateParams,
  TeamsFetchParams,
  TeamsFetchResponse,
  TeamUpdateParams,
} from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const fetchTeamList = (params: TeamsFetchParams): Promise<TeamsFetchResponse> =>
  new Promise((resolve) => {
    FoxPageApi.get('/team-searchs', params, (rs: TeamsFetchResponse) => {
      resolve(rs);
    });
  });

export const addTeam = (params: TeamAddParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.post('/teams', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const updateTeam = (params: TeamUpdateParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.put('/teams', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const deleteTeam = (params: TeamDeleteParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.put('/teams/status', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

// team user
export const fetchTeamUsers = (params: TeamMembersFetchParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.get('/teams/member-searchs', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const AddTeamUsers = (params: TeamMembersUpdateParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.post('/teams/members', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const deleteTeamUsers = (params: TeamMembersUpdateParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.put('/teams/members-status', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });
