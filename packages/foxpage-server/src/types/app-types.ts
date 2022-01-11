import { Application, Folder, Organization } from '@foxpage/foxpage-server-types';

import { Creator, Search } from './index-types';

export type AppInfo = Exclude<Application, 'creator'> & { creator: Creator };
export type AppSearch = Search & { organizationId?: string };
export type AppWithFolder = Application & { folders: Folder[] };
export type AppBaseInfo = Pick<Application, 'id' | 'name'>;
export type AppOrgInfo = Pick<Application, 'id' | 'name'> & {
  organization: Pick<Organization, 'id' | 'name'>;
};

export interface AppDefaultFolder {
  applicationId: string;
  parentFolderId?: string;
  folderNames: string[];
  creator: string;
}
