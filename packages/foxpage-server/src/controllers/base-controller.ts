import * as Service from '../services';
import { PageInfo, PageSize } from '../types/index-types';

export class BaseController {
  protected service: typeof Service;
  constructor() {
    this.service = Service;
  }

  /**
   * format paging
   * @param counts 
   * @param pageSize 
   * @returns 
   */
  paging(counts: number, pageSize: PageSize): PageInfo {
    return {
      total: counts,
      page: pageSize.page,
      size: pageSize.size,
    };
  }

  /**
   * Get the route path value
   * @param url 
   * @param position 
   * @returns 
   */
  getRoutePath(url: string, typeMap: Record<string, string>, position: number): string {
    const path = url.split('?')[0];
    const pathList = path.split('/');
    const apiPath = pathList[position] || '';

    return typeMap[apiPath];
  }
}
