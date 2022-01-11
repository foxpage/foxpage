import React, { useCallback } from 'react';
import { Link, NavLink, useHistory } from 'react-router-dom';

import { DownOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Layout, Menu } from 'antd';
import styled from 'styled-components';

import { getImageLinkByEnv, getLoginUser, setLoginUser } from '@/utils/index';

const { Header } = Layout;

const StyledLink = styled(Link)`
  color: #fff;
  text-decoration: none;
  user-select: none;
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

const FoxpageHeader = () => {
  const { organizationId, userInfo } = getLoginUser();
  const history = useHistory();

  const handleLogout = useCallback(() => {
    setLoginUser();
    history.push('/login');
  }, []);

  return (
    <Header
      key="1"
      style={{
        backgroundColor: '#Fff',
        display: 'flex',
        boxShadow: 'rgb(100 100 100 / 20%) 0px 2px 3px 0px',
        zIndex: 100,
        padding: 0,
      }}
    >
      <Logo key="foxpage-logo">
        <StyledLink to={`/organization/${organizationId}/projects`}>
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
          <NavLinkContent
            activeStyle={{ color: '#212121 !important', textDecoration: 'none !important', fontWeight: 'bold' }}
            to={`/organization/${organizationId}/projects`}
          >
            Organization
          </NavLinkContent>
        </NavItem>
        {/* <NavItem>
          <NavLinkContent
            activeStyle={{ color: '#212121 !important', textDecoration: 'none !important', fontWeight: 'bold' }}
            to="/workspace"
          >
            Workspace
          </NavLinkContent>
        </NavItem> */}
        <NavItem>
          <NavLinkContent
            activeStyle={{ color: '#212121 !important', textDecoration: 'none !important', fontWeight: 'bold' }}
            to="/store"
          >
            Store
          </NavLinkContent>
        </NavItem>
      </MainNav>
      <User>
        <Avatar size={28} icon={<UserOutlined />} />
        <Dropdown
          trigger={['click']}
          overlay={
            <Menu>
              <Menu.Item key="0" onClick={handleLogout}>
                <LogoutOutlined style={{ marginRight: 8 }} />
                Logout
              </Menu.Item>
            </Menu>
          }
        >
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
