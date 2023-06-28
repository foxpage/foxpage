import { message } from 'antd';

import { ResponseBody } from '@/types/index';

import { getBusinessI18n } from '../locales';

export const errorToast = (res: ResponseBody, msg: string) => {
  const {
    global: { accessDeny },
  } = getBusinessI18n();
  if (res.code === 403) {
    message.error(accessDeny);
  } else {
    message.error(msg);
  }
};
