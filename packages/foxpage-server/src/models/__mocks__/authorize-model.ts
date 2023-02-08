import { BaseModel } from './base-model';

/**
 * authorize repository related classes
 */
export class AuthorizeModel extends BaseModel {
  private static _instance: AuthorizeModel;

  constructor() {
    super();
  }

  public static getInstance(): AuthorizeModel {
    this._instance || (this._instance = new AuthorizeModel());
    return this._instance;
  }
}
