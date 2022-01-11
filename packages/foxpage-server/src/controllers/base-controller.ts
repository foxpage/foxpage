import * as Service from '../services';

export class BaseController {
  protected service: typeof Service;
  constructor() {
    this.service = Service;
  }
}
