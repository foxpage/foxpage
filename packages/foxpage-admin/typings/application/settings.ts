import { AbstractEntity, Application, CommonFetchParams, ComponentCategory } from '@/types/index';

export interface ApplicationRegion {
  name: string;
  languages: string[];
}

export interface ApplicationSaveParams
  extends Pick<Application, 'host' | 'intro' | 'locales' | 'name' | 'resources'> {
  applicationId: string;
  slug: string;
}

export interface ApplicationSettingBuilderComponent extends AbstractEntity {
  category: ComponentCategory;
  delivery: string;
  name: string;
  status: boolean;
  type: string;
}

export interface ApplicationSettingBuilderFetchParams extends Omit<CommonFetchParams, 'organizationId'> {
  type: string;
}

export interface ApplicationSettingBuilderSaveParams extends Pick<ApplicationSaveParams, 'applicationId'> {
  type: string;
  setting: Array<{
    id: string;
    name: string;
    status: boolean;
    category: ComponentCategory;
  }>;
}
