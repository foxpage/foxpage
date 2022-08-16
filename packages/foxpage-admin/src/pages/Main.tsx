import 'moment/locale/zh-cn';

import React, { useEffect, useState } from 'react';
import { Route, Switch } from 'react-router-dom';

import { ConfigProvider } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import zhCN from 'antd/lib/locale/zh_CN';
import styled from 'styled-components';

import { LOCALE_EN, LOCALE_ZH_CN } from '@/constants/index';
import businessLocale from '@/foxI18n/index';
import { FoxI18n } from '@/types/index';
import { getLoginUser, setGlobalLocale } from '@/utils/index';

import { GlobalContext, Internal, Login, Register } from './system/index';
import { Builder } from './builder';

const Root = styled.div`
  height: 100%;
`;

const AppMain = () => {
  const [locale, setLocale] = useState<FoxI18n>({
    ...zhCN,
    business: businessLocale[LOCALE_ZH_CN],
  });

  useEffect(() => {
    const { languagePrefer } = getLoginUser();
    if (!!languagePrefer)
      setLocale({
        ...(languagePrefer === LOCALE_ZH_CN ? zhCN : enUS),
        business: languagePrefer === LOCALE_ZH_CN ? businessLocale[LOCALE_ZH_CN] : businessLocale[LOCALE_EN],
      });
  }, []);

  useEffect(() => {
    setGlobalLocale(locale.locale);
  }, [locale]);

  return (
    <GlobalContext.Provider value={{ locale, setLocale }}>
      <ConfigProvider locale={locale}>
        <Root>
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/builder" component={Builder} />
            <Route path="/" component={Internal} />
          </Switch>
        </Root>
      </ConfigProvider>
    </GlobalContext.Provider>
  );
};

export default AppMain;
