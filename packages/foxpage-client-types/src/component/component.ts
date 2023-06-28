import { ComponentCategory } from './category';
import { ComponentMeta } from './meta';
import { ComponentResource } from './resource';

/**
 * foxpage component
 */
export interface Component {
  id: string;
  name: string;
  label: string;
  type: string;
  componentType: string;
  version: string;
  isLiveVersion?: boolean;
  isLive?: boolean;
  enableChildren?: boolean;
  schema?: string | Record<string, any>;
  deprecated?: boolean;
  meta?: ComponentMeta;
  /**
   * for editor or dependence component entry
   */
  components?: Component[];
  /**
   * curr component entry
   */
  resource?: ComponentResource;
  /**
   * category: group
   */
  category?: ComponentCategory;
  status?: boolean;
  defaultValue?: {
    props: Record<string, any>;
  };
  useStyleEditor?: boolean;
  __extentions?: ComponentExtentions;
}

interface ComponentExtentions {
  disabled?: boolean;
}

export interface ComponentProps {
  [name: string]: string | ComponentProps;
}

export type ComponentSourceMap = Record<string, Component>;
