import { BaseResponse } from '@/types/common';

export interface PreviewResultFetchParams {
  app_id: string;
  page_id: string;
}

export interface PreviewResponse extends BaseResponse {
  html: string;
}
