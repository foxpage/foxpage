import { AbstractEntity, CommonFetchParams } from '@/types/index';

export interface ApplicationResourcesFetchParams extends Pick<CommonFetchParams, 'applicationId'> {
  type?: string;
}

// AppResourceGroupType
export interface ApplicationResourceGroupTypeEntity extends Pick<AbstractEntity, 'id'> {
  name: string;
  type: string;
  detail: {
    host: string;
    downloadHost: string;
  };
}
