import {
  ResponseBody,
  TeamAddParams,
  TeamDeleteParams,
  TeamFetchParams,
  TeamFetchResponse,
  TeamUpdateParams,
  TeamUsersAddReqParams,
  TeamUsersFetchParams,
} from '@/types/index';
import FoxpageApi from '@/utils/foxpage-api-sdk';

export const fetchTeamList = (params: TeamFetchParams): Promise<TeamFetchResponse> =>
  new Promise(resolve => {
    FoxpageApi.get('/team-searchs', params, (rs: TeamFetchResponse) => {
      resolve(rs);
    });
  });

export const addTeam = (params: TeamAddParams): Promise<ResponseBody> =>
  new Promise(resolve => {
    FoxpageApi.post('/teams', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const updateTeam = (params: TeamUpdateParams): Promise<ResponseBody> =>
  new Promise(resolve => {
    FoxpageApi.put('/teams', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const deleteTeam = (params: TeamDeleteParams): Promise<ResponseBody> =>
  new Promise(resolve => {
    FoxpageApi.put('/teams/status', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const AddTeamUsers = (params: TeamUsersAddReqParams): Promise<ResponseBody> =>
  new Promise(resolve => {
    FoxpageApi.post('/teams/members', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const deleteTeamUsers = (params: TeamUsersAddReqParams): Promise<ResponseBody> =>
  new Promise(resolve => {
    FoxpageApi.put('/teams/members-status', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const fetchTeamUsers = (params: TeamUsersFetchParams): Promise<ResponseBody> =>
  new Promise(resolve => {
    FoxpageApi.get('/teams/member-searchs', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });
