import { BaseModelAbstract } from './abstracts/base-model-abstract';

export class VersionModel extends BaseModelAbstract {
  private static _instance: VersionModel;

  constructor() {
    super();
  }

  public static getInstance(): VersionModel {
    this._instance || (this._instance = new VersionModel());
    return this._instance;
  }

  getLatestVersionInfo() {
    return {};
  }

  getDetailByVersionNumber() {
    return {};
  }

  setStatus() {
    return {};
  }

  getDetailByIdAndVersions() {
    return [];
  }

  getDetailByIdAndVersionString() {
    return {};
  }

  getMaxVersionDetailById() {
    return {};
  }
}
