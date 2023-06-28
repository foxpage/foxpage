import { Application, CommonFetchParams, ComponentCategory } from '@foxpage/foxpage-client-types';

export interface ApplicationSaveParams
  extends Pick<Application, 'host' | 'intro' | 'locales' | 'name' | 'resources'> {
  applicationId: string;
  slug: string;
}

export interface ApplicationSettingBuilderFetchParams extends Omit<CommonFetchParams, 'organizationId'> {
  type: string;
}

export interface ApplicationSettingBuilderSaveParams extends Pick<ApplicationSaveParams, 'applicationId'> {
  type: string;
  setting: Array<{
    id: string;
    idx?: string;
    name: string;
    status: boolean;
    category?: ComponentCategory;
    defaultValue?: any;
  }>;
}

export interface ApplicationSettingBuilderDeleteParams extends Pick<ApplicationSaveParams, 'applicationId'> {
  type: string;
  ids: string;
}
