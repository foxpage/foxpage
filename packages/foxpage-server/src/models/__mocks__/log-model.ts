import { BaseModel } from './base-model';

export class LogModel extends BaseModel {
  private static _instance: LogModel;

  constructor() {
    super();
  }

  public static getInstance(): LogModel {
    this._instance || (this._instance = new LogModel());
    return this._instance;
  }
}
