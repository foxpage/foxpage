import { startService } from './app';

jest.mock('../../src/utils/mongoose');

export class App {
  private static _instance: App;

  constructor() {}

  public static getInstance(): App {
    if (!this._instance) {
      this._instance = startService();
    }

    return this._instance;
  }
}
