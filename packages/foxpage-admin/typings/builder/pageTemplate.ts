import { CommonFetchParams } from '@/types/index';

export interface PageTemplateFetchParams extends Omit<CommonFetchParams, 'organizationId'> {
  type: string;
  scope: string;
}
