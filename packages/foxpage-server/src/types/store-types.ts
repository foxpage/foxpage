import { Search } from './index-types';

export interface StorePageParams extends Search {
  type?: string;
  appIds?: string[];
}

export interface StoreFileStatus {
  id: string;
  status: number;
}
