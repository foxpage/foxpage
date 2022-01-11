import { BaseModelAbstract } from './abstracts/base-model-abstract';

export class LogModel extends BaseModelAbstract {
  private static _instance: LogModel;

  constructor() {
    super();
  }

  public static getInstance(): LogModel {
    this._instance || (this._instance = new LogModel());
    return this._instance;
  }
}
