import { ResponseBody } from '@foxpage/foxpage-client-types';

export interface ScreenshotPicture {
  url: string;
  type: string;
  sort: number;
}

export interface Screenshot {
  id: string;
  name: string;
  versionId: string;
  version: string;
  pictures: ScreenshotPicture[];
}

export type Screenshots = Record<string, ScreenshotPicture[]>;

export interface ScreenshotFetchParams {
  applicationId: string;
  type: 'file' | 'content' | 'version';
  typeIds: string[];
}

export interface ScreenshotFetchedRes extends ResponseBody {
  data: Record<string, Screenshot[]>;
}
