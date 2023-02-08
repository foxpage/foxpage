/**
 * visual editor base config
 */
export interface VisualEditorConfig {
  sys?: {
    locale?: string;
    visualFrameSrc?: string;
    mockable?: boolean;
    readOnly?: boolean;
  };
  app?: {
    appId?: string;
  };
  page?: {
    locale?: string;
    fileType?: string;
  };
}

export interface BuilderURLParams {}
