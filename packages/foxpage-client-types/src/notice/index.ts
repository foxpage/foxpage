export interface Notice {
  type: 'info' | 'warning' | 'error';
  status: boolean;
  language: string;
  message: string;
  closable?: boolean;
}
