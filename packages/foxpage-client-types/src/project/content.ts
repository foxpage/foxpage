import { AbstractEntity } from '../common';
import { Creator } from '../user';

import { File } from './file';

export interface ContentEntity extends Pick<File, 'id' | 'type' | 'creator' | 'tags'> {
  title: string;
  fileId: string;
  fold?: boolean;
  urls: string[];
  isBase?: boolean;
  version?: string;
  extendId?: string;
  liveVersionNumber?: number;
}

// content history
export interface ContentVersionData extends AbstractEntity {
  contentId: string;
  version: string;
  isLive: boolean;
  publisher: Creator;
}
