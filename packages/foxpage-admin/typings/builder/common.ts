/**
 * visual editor base config
 */
export interface VisualEditorConfig {
  sys?: {
    locale?: string;
    visualFrameSrc?: string;
    mockable?: boolean;
  };
  app?: {
    appId?: string;
  };
  page?: {
    locale?: string;
  };
}

export interface BuilderURLParams {}
