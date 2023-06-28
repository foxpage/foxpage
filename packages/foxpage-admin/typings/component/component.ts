import { BaseResponse, Component } from '@foxpage/foxpage-client-types';

export interface ComponentFetchRes extends BaseResponse<Component[]> {}

export interface ComponentVersionFetchParams {
  applicationId: string;
  id?: string;
  name?: string;
}

export interface ComponentVersionDetailsFetchParams {
  applicationId: string;
  nameVersions: { name: string; version: string }[];
}

export interface ComponentVersionDetailsFetchedRes
  extends BaseResponse<
    {
      name: string;
      version: string;
      package: Component;
    }[]
  > {}
