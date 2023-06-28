import { Application, Folder, Organization } from '@foxpage/foxpage-server-types';

import { Creator, Search } from './index-types';
import { UserBase } from './user-types';

export type AppInfo = Exclude<Application, 'creator'> & { creator: Creator };
export type AppSearch = Search & { organizationId?: string; creator?: string; type?: string };
export type AppWithFolder = Application & { folders: Folder[] };
export type AppBaseInfo = Pick<Application, 'id' | 'name'>;
export type AppOrgInfo = Pick<Application, 'id' | 'name'> & {
  organization: Pick<Organization, 'id' | 'name'>;
};

export type AppItemSearch = { applicationId: string } & Search;

export interface AppDefaultFolder {
  applicationId: string;
  parentFolderId?: string;
  folderNames: string[];
  creator: string;
}

export interface AddAppSetting {
  applicationId: string;
  type: string;
  typeId: string;
  typeName: string;
  typeStatus?: boolean;
  category?: Record<string, any>;
  defaultValue?: Record<string, any>;
  idx?: number;
}

export interface UpdateAppSetting {
  applicationId: string;
  type: string;
  typeId: string;
  setting: {
    idx: number;
    id: string;
    name: string;
    status?: boolean;
    category?: Record<string, any>;
    defaultValue?: Record<string, any>;
    createTime?: Date;
    updateTime?: Date;
  };
}

export interface AppSettingInfo {
  idx?: number;
  id: string;
  name: string;
  type: string;
  status: string;
  delivery: string;
  category?: Record<string, any>;
  defaultValue?: Record<string, any>;
  creator: UserBase;
  createTime?: Date;
  updateTime?: Date;
}
