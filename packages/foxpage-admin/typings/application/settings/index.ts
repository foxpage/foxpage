import { Application } from '@/types/application';

export interface RegionType {
  name: string;
  languages: string[];
}

export interface ApplicationEditType extends Application {
  localeObjects: Array<{
    region: string;
    language: string;
  }>;
}
