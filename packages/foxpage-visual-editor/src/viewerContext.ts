import React, { CSSProperties } from 'react';

import { FoxpageComponentType } from '@foxpage/foxpage-js-sdk';

import zhCN from './i18n/zh-cn';
import { ComponentStructure, FoxpageI18n } from './interface.d';

const context = React.createContext<{
  loadedComponent: Record<string, FoxpageComponentType>;
  componentList: ComponentStructure[];
  zoom: number;
  containerStyle: CSSProperties;
  foxpageI18n: FoxpageI18n;
}>({
  loadedComponent: {},
  componentList: [],
  zoom: 1,
  containerStyle: {},
  foxpageI18n: zhCN,
});
export default context;
