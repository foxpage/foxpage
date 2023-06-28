import { AbstractEntity } from '../common';
import { ComponentCategory } from '../component';

export interface ApplicationRegion {
  name: string;
  languages: string[];
}

export interface ApplicationSettingBuilderComponent extends AbstractEntity {
  category: ComponentCategory;
  delivery: string;
  name: string;
  status: boolean;
  type: string;
  defaultValue?: any;
  idx: string;
}
