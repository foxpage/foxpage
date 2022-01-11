import { BaseModelAbstract } from './abstracts/base-model-abstract';

export class UserModel extends BaseModelAbstract {
  private static _instance: UserModel;

  constructor() {
    super();
  }

  /**
   * Single instance
   * @returns UserModel
   */
  public static getInstance(): UserModel {
    this._instance || (this._instance = new UserModel());
    return this._instance;
  }

  getUserByAccount() {
    return {};
  }

  getUserPwdByAccount() {
    return '';
  }

  addUser() {
    return {};
  }
}
