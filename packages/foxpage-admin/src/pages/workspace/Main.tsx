import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Redirect, Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom';

import {
  AppstoreOutlined,
  // ProfileOutlined,
  ProjectOutlined,
  RestOutlined,
  StarFilled,
  SwitcherOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Tooltip } from 'antd';
import styled from 'styled-components';

import { GlobalContext } from '@/pages/system';

import { Applications } from './applications';
import { Dynamics } from './dynamics';
import { MyProjects, RecycleBin, TeamProjects } from './projects';

const { Sider } = Layout;

const Location = styled.div`
  line-height: 48px;
  height: 48px;
  display: inline-block;
  width: 100%;
  color: rgba(0, 0, 0, 0.54);
  border-bottom: 1px solid rgb(221, 221, 221);
  background: #fff;
  border-right: 1px solid #f0f0f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const MenuItemGroupTitle = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const WorkSpace = () => {
  const [selectedKeys, setSelectedKeys] = useState<Array<string>>(['project']);
  const [siderCollapsed, setSiderCollapsed] = useState(false);

  // route info
  const history = useHistory();
  const location = useLocation();
  const routeMatch = useRouteMatch();

  // i18n
  const { locale, organizationId } = useContext(GlobalContext);
  const { workspace, project, application, dynamic } = locale.business;
  // if organization id empty, back to login page
  if (!organizationId) {
    history.push({
      pathname: '/login',
    });
    return null;
  }

  useEffect(() => {
    const newKey = location.pathname.replace(routeMatch.url, '').replace('/', '').split('/');

    setSelectedKeys(newKey);
  }, [location]);

  const handleClick = useCallback((e: any) => {
    const pathname = `/workspace/${e.keyPath.reverse().join('/')}`;
    history.push({
      pathname,
    });
  }, []);

  const handleBreakPoint = useCallback((broken) => {
    setSiderCollapsed(broken);
  }, []);

  const handleCollapse = useCallback((collapsed) => {
    setSiderCollapsed(collapsed);
  }, []);

  return (
    <Layout hasSider style={{ height: '100%', overflow: 'hidden' }}>
      <Sider
        theme="light"
        breakpoint="xxl"
        width={250}
        collapsible
        collapsedWidth={60}
        onBreakpoint={handleBreakPoint}
        onCollapse={handleCollapse}
        style={{ height: '100%' }}>
        <Tooltip title={workspace.name} placement="right">
          <Location style={{ paddingLeft: siderCollapsed ? 8 : 18 }}>{workspace.name}</Location>
        </Tooltip>
        <div className="h-full overflow-auto">
          <Menu
            mode="inline"
            theme="light"
            defaultOpenKeys={['projects', 'applications', 'dynamics']}
            selectedKeys={selectedKeys}
            onClick={handleClick}>
            <Menu.ItemGroup
              key="projects"
              title={
                <MenuItemGroupTitle style={{ paddingLeft: siderCollapsed ? 4 : 0 }}>
                  {project.name}
                </MenuItemGroupTitle>
              }>
              <Menu.SubMenu key="projects" title={project.myProject} icon={<ProjectOutlined />}>
                <Menu.Item key="personal" icon={<UserOutlined />}>
                  {project.personal}
                </Menu.Item>
                <Menu.Item key="shared" icon={<TeamOutlined />}>
                  {project.shared}
                </Menu.Item>
                <Menu.Item key="starred" icon={<StarFilled />}>
                  {project.starred}
                </Menu.Item>
              </Menu.SubMenu>
              {/* <Menu.Item key="team-projects" icon={<ProfileOutlined />}>
              {project.teamProject}
            </Menu.Item> */}
              <Menu.Item key="recycle-bin" icon={<RestOutlined />}>
                {project.recycleBin}
              </Menu.Item>
            </Menu.ItemGroup>
            <Menu.ItemGroup
              key="applications"
              title={
                <MenuItemGroupTitle style={{ paddingLeft: siderCollapsed ? 4 : 0 }}>
                  {application.name}
                </MenuItemGroupTitle>
              }>
              <Menu.Item key="applications" icon={<AppstoreOutlined />}>
                {application.myApplication}
              </Menu.Item>
            </Menu.ItemGroup>
            <Menu.ItemGroup
              key="dynamics"
              title={
                <MenuItemGroupTitle style={{ paddingLeft: siderCollapsed ? 4 : 0 }}>
                  {dynamic.name}
                </MenuItemGroupTitle>
              }>
              <Menu.Item key="dynamics" icon={<SwitcherOutlined />}>
                {dynamic.myDynamic}
              </Menu.Item>
            </Menu.ItemGroup>
          </Menu>
        </div>
      </Sider>
      <Switch>
        <Route path="/workspace/applications" component={Applications} />
        <Route path="/workspace/projects" component={MyProjects} />
        <Route path="/workspace/team-projects" component={TeamProjects} />
        <Route path="/workspace/recycle-bin" component={RecycleBin} />
        <Route path="/workspace/dynamics" component={Dynamics} />

        <Redirect from="/*" to="/workspace/projects" />
      </Switch>
    </Layout>
  );
};

export default WorkSpace;
