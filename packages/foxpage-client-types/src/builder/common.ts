import { Application } from '../application';

import { PageContent } from './content';

/**
 * visual editor base config
 */
export interface VisualEditorConfig {
  sys?: {
    locale?: string;
    visualFrameSrc?: string;
    mockable?: boolean;
    readOnly?: boolean;
    zoom?: number;
    viewWidth?: string;
  };
  app?: {
    appId?: string;
  };
  page?: {
    id?: string;
    locale?: string;
    fileType?: string;
  };
}

export type ParseOptions = {
  application: Application;
  locale?: string;
  file: File;
  parseInLocal?: boolean; // local(client) parse
  extendContent?: PageContent;
};
