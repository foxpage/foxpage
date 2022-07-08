import { Application } from '@/types/application';

export interface RegionType {
  name: string;
  languages: string[];
}

export interface ApplicationEditType extends Omit<Application, 'host'> {
  localeObjects: Array<{
    region: string;
    language: string;
  }>;
  host: Array<{
    url: string;
    locales: string[];
  }>;
}
