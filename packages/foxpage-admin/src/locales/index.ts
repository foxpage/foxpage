import { FoxI18n } from '@/types/index';
import { getGlobalLocale } from '@/utils/global';

import businessEn from './en/en';
import businessZhCN from './zh/zh-cn';

const foxI18n = {
  'zh-cn': businessZhCN,
  en: businessEn,
};

export const getBusinessI18n = (): FoxI18n['business'] => {
  return foxI18n[getGlobalLocale() || 'zh-cn'];
};

export default foxI18n;
