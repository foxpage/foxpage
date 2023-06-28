import * as appConfig from '../../../app.config';

/**
 * default metric class
 */
class DefaultMetric {
  private timeObject: Record<string, number> = {};

  constructor() {}

  /**
   * time tag, create timestamp value
   */
  time(tag: string): void {
    tag && (this.timeObject[tag] = new Date().getTime());
  }

  /**
   * save request metric log
   * @param method
   * @param api
   * @param latency
   * @param code
   */
  request(method: string, api: string, latency: number, appId: string, code: number = 200): void {
    if (appConfig.config.metric?.debug) {
      console.log(' [request metric] ', method, api, appId, latency + 'ms', code);
    }
  }

  /**
   * save mongodb metric log
   * @param sql
   * @param latency
   * @param code
   */
  mongo(sql: string, code: number = 0, latency: number): void {
    if (appConfig.config.metric?.debug) {
      console.log(' [mongo metric] ', sql, latency + 'ms', code);
    }
  }

  /**
   * save api function block log
   * @param blockName
   * @param timeTag
   */
  block(blockName: string, timeTag: string): void {
    if (appConfig.config.metric?.debug) {
      let latency = 0;
      if (this.timeObject[timeTag]) {
        latency = new Date().getTime() - this.timeObject[timeTag];
        delete this.timeObject[timeTag];
      }

      console.log(' [block metric] ', blockName, latency + 'ms');
    }
  }

  /**
   * save api response epmty result log
   * @param apiName
   */
  empty(apiName: string, appId: string = ''): void {
    if (appConfig.config.metric?.debug) {
      console.log(' [response empty metric] ', apiName, appId);
    }
  }
}

export default DefaultMetric;
