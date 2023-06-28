import { Application, CommonFetchParams, ResponseBody } from '@foxpage/foxpage-client-types';

export interface ApplicationListFetchParams extends CommonFetchParams {
  type?: string;
}

export interface ApplicationListFetchResponse extends ResponseBody {
  data?: Application[];
}
