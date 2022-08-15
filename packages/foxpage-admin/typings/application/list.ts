import { Application, CommonFetchParams, ResponseBody } from '@/types/index';

export interface ApplicationListFetchParams extends CommonFetchParams {
  type?: string;
}

export interface ApplicationListFetchResponse extends ResponseBody {
  data?: Application[];
}
