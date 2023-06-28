import { Application } from '../application';
import { AbstractEntity } from '../common';
import { ContentEntity, FileType } from '../project';

export interface StoreResource extends Pick<AbstractEntity, 'id' | 'createTime' | 'creator' | 'updateTime'> {
  application: Pick<Application, 'id' | 'name'>;
  checked?: boolean;
  intro: string;
  name: string;
}

export interface StoreResourceDetail extends Pick<StoreResource, 'id'> {
  applicationId: string;
  projectId: string;
  type: string;
}

export interface StoreFileResource extends Pick<StoreResource, 'id' | 'name'> {
  details: StoreResourceDetail;
  type: FileType;
  contents?: ContentEntity[];
  pictures: [
    {
      url: string;
      type: string;
      sort: number;
    },
  ];
}

export interface StoreProjectResource extends StoreResource {
  files: Array<StoreFileResource>;
}

export interface StorePackageResource extends StoreResource {
  details: StoreResourceDetail;
}
