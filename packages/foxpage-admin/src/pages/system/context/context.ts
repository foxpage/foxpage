import React from 'react';

import zhCN from 'antd/lib/locale/zh_CN';

import businessLocale from '@/foxI18n/index';
import { FoxI18n } from '@/types/index';

const context = React.createContext<{
  locale: FoxI18n;
  setLocale: (locale: FoxI18n) => void;
  organizationId: string;
  setOrganizationId: (id: string) => void;
}>({
  locale: { ...zhCN, business: businessLocale['zh-cn'] },
  setLocale: () => {},
  organizationId: '',
  setOrganizationId: () => {},
});

export default context;
