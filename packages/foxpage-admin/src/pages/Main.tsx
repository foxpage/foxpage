import 'dayjs/locale/zh-cn'; // 导入本地化语言

import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Route, Switch, useHistory } from 'react-router-dom';

import { ConfigProvider, Modal } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import zhCN from 'antd/lib/locale/zh_CN';
import styled from 'styled-components';

import { updateOrganizationId } from '@/actions/system/user';
import { LOCALE_EN, LOCALE_ZH_CN } from '@/constants/index';
import businessLocale from '@/foxI18n/index';
import { FoxI18n } from '@/types/index';
import { getLoginUser, isChrome, setGlobalLocale, setLoginUser } from '@/utils/index';

import { GlobalContext, Internal, Login, Register } from './system/index';
import { Builder } from './builder';
import { Preview } from './preview';

const Root = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  updateOrganizationId,
};

type AppProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const AppMain = (props: AppProps) => {
  const { updateOrganizationId } = props;
  const [locale, setLocale] = useState<FoxI18n>({
    ...zhCN,
    business: businessLocale[LOCALE_ZH_CN],
  });

  // user info
  const { languagePrefer, userInfo } = getLoginUser();
  const [organizationId, setOrganizationId] = useState<string>(userInfo?.organizationId || '');

  const history = useHistory();

  if (!organizationId) {
    history.push({
      pathname: '/login',
    });

    return null;
  }

  useEffect(() => {
    if (!!languagePrefer)
      setLocale({
        ...(languagePrefer === LOCALE_ZH_CN ? zhCN : enUS),
        business: languagePrefer === LOCALE_ZH_CN ? businessLocale[LOCALE_ZH_CN] : businessLocale[LOCALE_EN],
      });
  }, []);

  useEffect(() => {
    setGlobalLocale(locale.locale);
  }, [locale]);

  useEffect(() => {
    const loginUserInfo = getLoginUser();

    setLoginUser({
      ...loginUserInfo,
      userInfo: {
        ...loginUserInfo.userInfo,
        organizationId,
      },
    });

    if (typeof updateOrganizationId === 'function') updateOrganizationId(organizationId);
  }, [organizationId, updateOrganizationId]);

  return (
    <GlobalContext.Provider value={{ locale, setLocale, organizationId, setOrganizationId }}>
      <ConfigProvider locale={locale}>
        <Root>
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/builder" component={Builder} />
            <Route path="/preview" component={Preview} />
            <Route path="/" component={Internal} />
          </Switch>
        </Root>
        <Modal
          open={!isChrome()}
          title={locale.business.global.notice}
          maskClosable={false}
          centered={true}
          closable={false}
          footer={null}>
          <span>{locale.business.global.browserNotice}</span>
        </Modal>
      </ConfigProvider>
    </GlobalContext.Provider>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(AppMain);
