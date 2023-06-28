import { CommonFetchParams } from '@foxpage/foxpage-client-types';

export interface ApplicationResourcesFetchParams extends Pick<CommonFetchParams, 'applicationId'> {
  type?: string;
}
