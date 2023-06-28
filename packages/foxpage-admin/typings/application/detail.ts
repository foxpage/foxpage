import { Application, ResponseBody } from '@foxpage/foxpage-client-types';

export interface ApplicationDetailFetchResponse extends ResponseBody {
  data?: Application;
}
