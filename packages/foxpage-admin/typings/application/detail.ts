import { Application, ResponseBody } from '@/types/index';

export interface ApplicationDetailFetchResponse extends ResponseBody {
  data?: Application;
}
