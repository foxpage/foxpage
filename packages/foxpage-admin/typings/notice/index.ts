import { ResponseBody } from '../common';

export interface Notice {
  type: 'info' | 'warning' | 'error';
  status: boolean;
  language: string;
  message: string;
  closable?: boolean;
}

export interface NoticeFetchedResponse extends ResponseBody<Notice> {}
