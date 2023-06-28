import { LockerState, ResponseBody } from '@foxpage/foxpage-client-types';

export interface LockerParams {
  applicationId: string;
  contentId: string;
  versionId: string;
}

export interface LockerResponse
  extends ResponseBody<
    Omit<LockerState, 'locked' | 'blocked' | 'preLocked' | 'needUpdate'> & {
      status: boolean;
      lockStatus: boolean;
    }
  > {}
