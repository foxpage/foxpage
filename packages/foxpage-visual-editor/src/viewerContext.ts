import React, { CSSProperties } from 'react';

import { FoxpageComponentType } from '@foxpage/foxpage-js-sdk';

import { ComponentStructure, FoxpageI18n } from '@/types/component';

import zhCN from './i18n/language/zh-cn.json';

const context = React.createContext<{
  loadedComponent: Record<string, FoxpageComponentType>;
  componentList: ComponentStructure[];
  zoom: number;
  containerStyle: CSSProperties;
  foxpageI18n: FoxpageI18n;
  locale: string;
}>({
  loadedComponent: {},
  componentList: [],
  zoom: 1,
  containerStyle: {},
  foxpageI18n: zhCN,
  locale: '',
});
export default context;
