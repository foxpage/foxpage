import { AbstractEntity } from '../common';

export interface ApplicationHost {
  url: string;
  locales: string[];
}

// Before multi-host supported, host type is string[]
export interface Application extends Pick<AbstractEntity, 'id' | 'createTime' | 'creator' | 'updateTime'> {
  name: string;
  deleted: boolean;
  host: ApplicationHost[];
  intro: string;
  locales: string[];
  organizationId: string;
  resources: ApplicationResource[];
  slug: string;
  organization?: {
    id: string;
    name: string;
  };
}

export interface ApplicationResource extends Pick<Application, 'id' | 'name'> {
  detail: {
    host: string;
    downloadHost: string;
  };
  type: number;
}

export interface ApplicationEntityMultiHost extends Omit<Application, 'host'> {
  host: ApplicationHost[];
  localeObjects: Array<{
    region: string;
    language: string;
  }>;
}
