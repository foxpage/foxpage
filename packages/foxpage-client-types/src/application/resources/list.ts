import { AbstractEntity } from '../../common';

// AppResourceGroupType
export interface ApplicationResourceGroupTypeEntity extends Pick<AbstractEntity, 'id'> {
  name: string;
  type: string;
  detail: {
    host: string;
    downloadHost: string;
  };
}
