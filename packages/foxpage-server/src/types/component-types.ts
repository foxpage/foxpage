import { Component } from '@foxpage/foxpage-server-types';

import { NameVersion } from './index-types';

export type ComponentContentInfo = Component & {
  name: string;
  version: string;
  type: string;
  isLive: boolean;
};
export interface ComponentInfo {
  name: string;
  content: ComponentContentInfo;
  version?: string;
}

export interface ComponentNameVersion {
  applicationId: string;
  nameVersions: NameVersion[];
  type?: string[];
}

export interface ContentPath {
  contentId: string;
  path: string;
}
