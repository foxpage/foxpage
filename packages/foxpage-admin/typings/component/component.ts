import { BaseResponse } from '@/types/index';

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
  version: string;
  isLiveVersion?: boolean;
  enableChildren?: boolean;
  schema?: string | Record<string, any>;
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
  useStyleEditor?: boolean;
}

export interface ComponentProps {
  [name: string]: string | ComponentProps;
}

// export interface StructureNode extends Omit<Component, 'components' | 'isLiveVersion'> {
//   parentId?: string;
//   wrapper?: string;
//   children: Array<StructureNode>;
//   position?: number;
//   relation?: RelationEntity;
//   props?: ComponentProps;
//   mock?: ComponentProps;
//   directive?: Directive;
//   isUpdate?: boolean;
//   belongTemplate?: boolean;
//   enableChildren?: boolean;
//   extension?: Extension;
// }

// ComponentSourceMapType
export type ComponentSourceMap = Record<string, Component>;

export interface ComponentFetchRes extends BaseResponse<Component[]> {}
