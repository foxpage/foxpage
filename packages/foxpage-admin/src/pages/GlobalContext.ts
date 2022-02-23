import React from 'react';

import zhCN from 'antd/lib/locale/zh_CN';

import { Locale } from '@/types/common';

import { ZH_CN_STRING } from '../constants';

import businessLocale from './locale';

const context = React.createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
}>({
  locale: { ...zhCN, business: businessLocale[ZH_CN_STRING] },
  setLocale: () => {},
});
export default context;
