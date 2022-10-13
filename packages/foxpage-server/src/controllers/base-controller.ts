import { TYPE } from '../../config/constant';
import * as Service from '../services';
import { PageInfo, PageSize } from '../types/index-types';


export class BaseController {
  protected service: typeof Service;
  public typeMap: Record<string, string>;
  constructor() {
    this.service = Service;

    this.typeMap = {
      pages: TYPE.PAGE,
      templates: TYPE.TEMPLATE,
      blocks: TYPE.BLOCK,
      variables: TYPE.VARIABLE,
      conditions: TYPE.CONDITION,
      functions: TYPE.FUNCTION,
      mocks: TYPE.MOCK,
      'page-content': TYPE.PAGE,
      'template-content': TYPE.TEMPLATE,
      'block-content': TYPE.BLOCK,
    };
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
  getRoutePath(url: string, position: number = 1): string {
    const path = url.split('?')[0];
    const pathList = path.split('/');
    const apiPath = pathList[position] || '';

    return this.typeMap[apiPath];
  }
}
