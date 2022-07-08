import React, { useCallback, useContext } from 'react';
import { Link, NavLink, useHistory } from 'react-router-dom';

import { DownOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Layout, Menu } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import zhCN from 'antd/lib/locale/zh_CN';
import styled from 'styled-components';

import OrganizationSelector from '@/components/business/OrganizationSelector';
import { EN_STRING, ZH_CN_STRING } from '@/constants/global';
import GlobalContext from '@/pages/GlobalContext';
import { getImageLinkByEnv, getLoginUser, setLoginUser } from '@/utils/index';

import businessLocale from '../locale';

const { Header } = Layout;

const StyledLink = styled(Link)`
  color: #fff;
  text-decoration: none;
  user-select: none;
  display: contents;
`;

const Logo = styled.div`
  justify-content: center;
  align-items: center;
  display: inline-flex;
  color: #fff;
  padding: 10px 0 10px 16px;
  flex: 0 0;
`;

const MainNav = styled.ul`
  list-style: none;
  padding: 7px 0;
  color: #757575;
  margin-left: 20px;
  margin-bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const NavItem = styled.li`
  float: left;
  font-size: 14px;
`;

const NavLinkContent = styled(NavLink)`
  border-radius: 4px;
  margin-right: 10px;
  color: #616161;
  display: block;
  line-height: 34px;
  padding: 0 16px;
  text-decoration: none;
  :hover {
    color: #212121;
    text-decoration: none;
  }
`;

const User = styled.div`
  position: absolute;
  right: 16px;
  height: 48px;
  display: flex;
  align-items: center;
`;

const UserName = styled.div`
  display: inline-flex;
  line-height: normal;
  cursor: pointer;
  align-items: center;
  > .user-account {
    margin-left: 12px;
    margin-right: 8px;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    max-width: 120px;
    overflow: hidden;
    vertical-align: middle;
  }
`;

const LocaleItem = styled.div`
  cursor: pointer;
  display: inline-flex;
  margin-right: 24px;
  color: #000000d9;
  border: 1px solid #d9d9d9;
  line-height: 16px;
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.3s;
  &:hover {
    border-color: #1890ff;
  }
`;

const FoxpageHeader = () => {
  const { userInfo } = getLoginUser();
  const history = useHistory();

  const { locale, setLocale } = useContext(GlobalContext);
  const { global, workspace, store, login } = locale.business || businessLocale[ZH_CN_STRING];

  const handleLogout = useCallback(() => {
    setLoginUser();
    history.push('/login');
  }, []);

  const handleLocaleChange = () => {
    const newLocale = {
      ...(locale.locale === ZH_CN_STRING ? enUS : zhCN),
      business: locale.locale === ZH_CN_STRING ? businessLocale[EN_STRING] : businessLocale[ZH_CN_STRING],
    };
    setLocale(newLocale);

    // update localstorage
    const loginUserInfo = getLoginUser();
    setLoginUser({
      ...loginUserInfo,
      languagePrefer: locale.locale === ZH_CN_STRING ? EN_STRING : ZH_CN_STRING,
    });
  };

  return (
    <Header
      key="1"
      style={{
        backgroundColor: '#Fff',
        display: 'flex',
        boxShadow: 'rgb(100 100 100 / 20%) 0px 2px 3px 0px',
        zIndex: 500,
        padding: 0,
        height: 48,
        position: 'fixed',
        width: '100%',
      }}>
      <Logo key="foxpage-logo">
        <StyledLink to="/workspace">
          <img
            key="foxpage-logo-img"
            height={28}
            width={140}
            src={getImageLinkByEnv('/images/header-logo.png')}
            alt="foxpage logo"
          />
        </StyledLink>
      </Logo>

      <MainNav>
        <NavItem>
          <OrganizationSelector />
        </NavItem>
        <NavItem>
          <NavLinkContent
            activeStyle={{
              fontWeight: 'bold',
            }}
            to="/workspace">
            {workspace.name}
          </NavLinkContent>
        </NavItem>
        <NavItem>
          <NavLinkContent
            activeStyle={{
              fontWeight: 'bold',
            }}
            to="/projects">
            {global.project}
          </NavLinkContent>
        </NavItem>
        <NavItem>
          <NavLinkContent
            activeStyle={{
              fontWeight: 'bold',
            }}
            to="/applications">
            {global.application}
          </NavLinkContent>
        </NavItem>
        <NavItem>
          <NavLinkContent
            activeStyle={{
              fontWeight: 'bold',
            }}
            to="/teams">
            {global.team}
          </NavLinkContent>
        </NavItem>
        <NavItem>
          <NavLinkContent
            activeStyle={{
              fontWeight: 'bold',
            }}
            to="/store">
            {store.name}
          </NavLinkContent>
        </NavItem>
      </MainNav>
      <User>
        <LocaleItem onClick={handleLocaleChange}>
          {locale.locale === ZH_CN_STRING ? 'English' : '简体中文'}
        </LocaleItem>
        <Avatar size={28} icon={<UserOutlined />} />
        <Dropdown
          trigger={['click']}
          overlay={
            <Menu>
              <Menu.Item key="0" onClick={handleLogout}>
                <LogoutOutlined style={{ marginRight: 8 }} />
                {login.loginOut}
              </Menu.Item>
            </Menu>
          }>
          <UserName>
            <span className="user-account">{userInfo?.account}</span>
            <DownOutlined />
          </UserName>
        </Dropdown>
      </User>
    </Header>
  );
};

export default FoxpageHeader;
