import { User, UserRegisterType } from '@foxpage/foxpage-server-types';

import { NewUser } from '../types/user-types';

import userModel from './schema/user';
import { BaseModel } from './base-model';

/**
 * User related data model
 *
 * @export
 * @class UserModel
 * @extends {BaseModel<User>}
 */
export class UserModel extends BaseModel<User> {
  private static _instance: UserModel;
  private userModel: typeof userModel;

  constructor() {
    super(userModel);
    this.userModel = userModel;
  }

  /**
   * Single instance
   * @returns UserModel
   */
  public static getInstance(): UserModel {
    this._instance || (this._instance = new UserModel());
    return this._instance;
  }

  /**
   * Get users through account
   * @param  {string} account
   * @returns {User} Promise
   */
  async getUserByAccount(account: string, registerType: UserRegisterType = 1): Promise<User> {
    return (await this.userModel.findOne({ account, registerType })) as User;
  }

  /**
   * Return only the password field value
   * @param  {string} account
   * @returns {string} Promise
   */
  async getUserPwdByAccount(account: string): Promise<string> {
    const userDetail = (await this.userModel.findOne({ account }, 'password')) as User;
    return userDetail?.password || '';
  }

  /**
   * Create User
   * @param  {Partial<NewUser>} params
   * @returns {User} Promise
   */
  async addUser(params: Partial<NewUser>): Promise<User> {
    return (await this.userModel.create(params))?.toObject();
  }
}
