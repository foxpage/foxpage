import { Component, File } from '@foxpage/foxpage-server-types';

import { NameVersion } from './index-types';

export type ComponentContentInfo = Component & {
  name: string;
  version: string;
  type: string;
  isLive: boolean;
  componentType?: string;
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

export interface ComponentCategory {
  name: string;
  categoryName: string;
  groupName: string;
  sort?: number;
  rank?: number;
  props?: Record<string, any>;
  description?: string;
  screenshot?: string;
}

export interface ComponentWithCategory extends File {
  category: ComponentCategory;
}

export interface ComponentCategoryTypes {
  categoryName: string;
  groupNames: string[];
}
