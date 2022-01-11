export interface StorePageParams {
  type?: string;
  appIds?: string[];
  search?: string;
  page?: number;
  size?: number;
}

export interface StoreFileStatus {
  id: string;
  status: number;
}
