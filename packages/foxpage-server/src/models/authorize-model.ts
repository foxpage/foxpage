import { Authorize } from '@foxpage/foxpage-server-types';

import authModel from './schema/authorize';
import { BaseModel } from './base-model';

/**
 * Authorize repository related classes
 */
export class AuthorizeModel extends BaseModel<Authorize> {
  private static _instance: AuthorizeModel;

  constructor() {
    super(authModel);
  }

  /**
   * Single instance
   * @returns AuthorizeModel
   */
  public static getInstance(): AuthorizeModel {
    this._instance || (this._instance = new AuthorizeModel());
    return this._instance;
  }
}
