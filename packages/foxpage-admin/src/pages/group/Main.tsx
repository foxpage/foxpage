import React, { useContext, useEffect, useState } from 'react';
import { Redirect, Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom';

import {
  AppstoreOutlined,
  ProjectOutlined,
  RestOutlined,
  SettingOutlined,
  SwitcherOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import styled from 'styled-components';

import { getLoginUser } from '@/utils/login-user';

import GlobalContext from '../GlobalContext';
import Dynamics from '../workspace/dynamics';
import Projects from '../workspace/projects';
import Recycles from '../workspace/recycles';

import ProjectContent from './project/content';
import ProjectDetail from './project/detail';
import ApplicationList from './application';
import Information from './information';
import Project from './project';
import Team from './team';
import User from './user';

const OrganizationName = styled.div`
  line-height: 48px;
  height: 48px;
  display: inline-block;
  width: 100%;
  color: rgba(0, 0, 0, 0.54);
  padding-left: 16px;
  border-bottom: 1px solid rgb(221, 221, 221);
  background: #fff;
  border-right: 1px solid #f0f0f0;
`;

const { Content, Sider } = Layout;

const Group = () => {
  const [selectedKeys, setSelectedKeys] = useState<Array<string>>(['application/list']);
  const history = useHistory();
  const location = useLocation();
  const routeMatch = useRouteMatch();
  const userInfo = getLoginUser();
  const organizationId = userInfo?.organizationId;

  const { locale } = useContext(GlobalContext);
  const { workspace, global } = locale.business;

  if (!organizationId) {
    history.push({
      pathname: '/login',
    });
    return null;
  }
  useEffect(() => {
    setSelectedKeys(
      location.pathname
        .replace(routeMatch.url, '')
        .replace('/', '')
        .split('/')
        .filter(item => !!item),
    );
  }, [location]);

  const handleClick = (e: any) => {
    const pathname = `/organization/${organizationId}/${e.keyPath.reverse().join('/')}`;
    history.push({
      pathname,
    });
  };
  return (
    <Layout hasSider style={{ height: '100%' }}>
      <Sider width={250} theme="light" style={{ height: '100%', overflow: 'auto' }}>
        <OrganizationName>Trip.com IBU PLT</OrganizationName>
        <Menu onClick={handleClick} mode="inline" selectedKeys={selectedKeys} theme="light">
          {/* <OrganizationName></OrganizationName> */}
          <Menu.ItemGroup key="workspace" title={workspace.name}>
            <Menu.Item key="projects" icon={<ProjectOutlined />}>
              {global.projects}
            </Menu.Item>
            <Menu.Item key="dynamics" icon={<SwitcherOutlined />}>
              {global.dynamics}
            </Menu.Item>
            <Menu.Item key="recycles" icon={<RestOutlined />}>
              {global.recycles}
            </Menu.Item>
          </Menu.ItemGroup>
          <Menu.ItemGroup key="management" title={global.management}>
            <Menu.Item key="application" icon={<AppstoreOutlined />}>
              {global.application}
            </Menu.Item>
            <Menu.Item key="project" icon={<ProjectOutlined />}>
              {global.project}
            </Menu.Item>
            <Menu.Item key="team" icon={<UsergroupAddOutlined />}>
              {global.team}
            </Menu.Item>
            <Menu.Item key="user" icon={<UserOutlined />}>
              {global.user}
            </Menu.Item>
            <Menu.Item key="setting" icon={<SettingOutlined />}>
              {global.setting}
            </Menu.Item>
          </Menu.ItemGroup>
          {/* <OrganizationName>Manifests</OrganizationName> */}
        </Menu>
      </Sider>
      <Content style={{ padding: 24, minHeight: 280, height: '100%', overflow: 'scroll' }}>
        <Switch>
          <Route
            path="/organization/:organizationId/projects/:applicationId/folder/:folderId/file/:fileId/content"
            component={ProjectContent}
          />
          <Route
            path="/organization/:organizationId/projects/:applicationId/folder/:folderId"
            component={ProjectDetail}
          />
          <Route
            path="/organization/:organizationId/project/:applicationId/folder/:folderId/file/:fileId/content"
            component={ProjectContent}
          />
          <Route
            path="/organization/:organizationId/project/:applicationId/folder/:folderId"
            component={ProjectDetail}
          />
          <Route path="/organization/:organizationId/application/list" component={ApplicationList} />
          <Route path="/organization/:organizationId/setting" component={Information} />
          <Route path="/organization/:organizationId/user" component={User} />
          <Route path="/organization/:organizationId/projects" component={Projects} />
          <Route path="/organization/:organizationId/dynamics" component={Dynamics} />
          <Route path="/organization/:organizationId/recycles" component={Recycles} />
          <Route path="/organization/:organizationId/project" component={Project} />
          <Route path="/organization/:organizationId/team" component={Team} />
          <Redirect
            from={`/organization/${organizationId}/application`}
            to={`/organization/${organizationId}/application/list`}
          />
          <Redirect from="/organization" to={`/organization/${organizationId}/projects`} />
        </Switch>
      </Content>
    </Layout>
  );
};

export default Group;
