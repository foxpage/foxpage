import { SearchModel } from '../../types/index-types';

export interface BaseServerInterface<T> {
  getList(params: SearchModel): Promise<T[]>;
  getDetailByIds(objectIds: string[]): Promise<T[]>;
  addDetail(detail: T): Promise<T[]>;
  updateDetail(id: string, data: Partial<T>): Promise<T>;
  setDeleteStatus(id: string, deleted: boolean): void;
}
