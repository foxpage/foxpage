import { CommonFetchParams } from '@foxpage/foxpage-client-types';

export interface PageTemplateFetchParams extends Omit<CommonFetchParams, 'organizationId'> {
  type: string;
  scope: string;
}
