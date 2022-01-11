import { BaseModelAbstract } from './abstracts/base-model-abstract';

export class TeamModel extends BaseModelAbstract {
  private static _instance: TeamModel;

  constructor() {
    super();
  }

  public static getInstance(): TeamModel {
    this._instance || (this._instance = new TeamModel());
    return this._instance;
  }

  getPageList() {
    return [];
  }

  getCount() {
    return 1;
  }
}
