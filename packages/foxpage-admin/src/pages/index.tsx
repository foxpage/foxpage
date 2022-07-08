import 'moment/locale/zh-cn';

import React, { useEffect, useState } from 'react';
import { Route, Switch } from 'react-router-dom';

import { ConfigProvider } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import zhCN from 'antd/lib/locale/zh_CN';
import styled from 'styled-components';

import { EN_STRING, ZH_CN_STRING } from '@/constants/global';
import { Locale } from '@/types/common';
import { setGlobalLocale } from '@/utils/global';
import { getLoginUser } from '@/utils/login-user';

import Internal from './sys/Internal';
import PrivateRoute from './sys/PrivateRoute';
import Builder from './builder';
import GlobalContext from './GlobalContext';
import businessLocale from './locale';
import Login from './login';
import Register from './register';

const Root = styled.div`
  height: 100%;
`;

const Index = () => {
  const [locale, setLocale] = useState<Locale>({
    ...zhCN,
    business: businessLocale['zh-cn'],
  });

  useEffect(() => {
    const { languagePrefer } = getLoginUser();
    if (!!languagePrefer)
      setLocale({
        ...(languagePrefer === ZH_CN_STRING ? zhCN : enUS),
        business: languagePrefer === ZH_CN_STRING ? businessLocale[ZH_CN_STRING] : businessLocale[EN_STRING],
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
            <Route path="/application/:applicationId/folder/:folderId/builder" component={Builder} />
            <Route
              path="/application/:applicationId/folder/:folderId/file/:fileId/builder"
              component={Builder}
            />
            <Route
              path="/application/:applicationId/folder/:folderId/file/:fileId/content/:contentId/builder"
              component={Builder}
            />
            <PrivateRoute path="/" component={Internal} />
          </Switch>
        </Root>
      </ConfigProvider>
    </GlobalContext.Provider>
  );
};

export default Index;
