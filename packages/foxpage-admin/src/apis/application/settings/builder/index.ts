import {
  ApplicationSettingBuilderDeleteParams,
  ApplicationSettingBuilderFetchParams,
  ApplicationSettingBuilderSaveParams,
} from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const getApplicationsBuilderSetting = (params: ApplicationSettingBuilderFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/applications/builder-setting-searchs', params, (rs: unknown) => {
      resolve(rs);
    });
  });

export const saveApplicationsBuilderSetting = (params: ApplicationSettingBuilderSaveParams) =>
  new Promise((resolve) => {
    FoxPageApi.put('/applications/builder-setting', params, (rs: unknown) => {
      resolve(rs);
    });
  });

export const deleteApplicationsBuilderSetting = (params: ApplicationSettingBuilderDeleteParams) =>
  new Promise((resolve) => {
    FoxPageApi.delete('/applications/builder-setting', params, (rs: unknown) => {
      resolve(rs);
    });
  });

export const getCategories = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.get('/components/category-types', params, (rs: unknown) => {
      resolve(rs);
    });
  });
