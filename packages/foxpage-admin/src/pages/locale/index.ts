import { Locale } from '@/types/common';
import { getGlobalLocale } from '@/utils/global';

import businessEn from './en/en';
import businessZhCN from './zh/zh-cn';

const locale = {
  'zh-cn': businessZhCN,
  en: businessEn,
};

export const getBusinessI18n = (): Locale['business'] => {
  return locale[getGlobalLocale() || 'zh-cn'];
};

export default locale;
