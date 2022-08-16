import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom';

import {
  AppstoreOutlined,
  BarsOutlined,
  BookOutlined,
  BranchesOutlined,
  BuildOutlined,
  ContainerOutlined,
  ControlOutlined,
  DashboardOutlined,
  FileOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  FunctionOutlined,
  ProjectOutlined,
  SettingOutlined,
  SlidersOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { GlobalContext } from '@/pages/system';
import * as ACTIONS from '@/store/actions/applications/detail/settings/application';

import Dynamics from './dynamics';
import File from './file';
import Overview from './overview';
import Packages from './packages';
import Projects from './projects';
import Resources from './resources';
import Settings from './settings';

const AppName = styled.div`
  line-height: 48px;
  height: 48px;
  display: inline-block;
  width: 100%;
  color: rgba(0, 0, 0, 0.54);
  padding-left: 24px;
  border-bottom: 1px solid rgb(221, 221, 221);
  background: #fff;
  border-right: 1px solid #f0f0f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const { Sider } = Layout;

const mapStateToProps = (store: RootState) => ({
  application: store.applications.detail.settings.app.application,
});

const mapDispatchToProps = {
  fetchAppDetail: ACTIONS.fetchApplicationInfo,
  updateApplicationId: ACTIONS.updateApplicationId,
};

type ApplicationDetailProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ApplicationDetail: React.FC<ApplicationDetailProps> = (props) => {
  const { application, fetchAppDetail, updateApplicationId } = props;
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Array<string>>(['files']);

  // url params
  const history = useHistory();
  const location = useLocation();
  const routeMatch = useRouteMatch();
  const { applicationId } = useParams<{ applicationId: string }>();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, file, setting } = locale.business;

  useEffect(() => {
    if (applicationId) {
      // fetch detail info
      fetchAppDetail(applicationId);

      // push to store
      updateApplicationId(applicationId);
    }
  }, []);

  // generate menu key with url search params
  useEffect(() => {
    setSelectedKeys(
      location.pathname
        .replace(routeMatch.url, '')
        .replace('/', '')
        .split('/')
        .filter((item) => !!item),
    );
  }, [location]);

  const handleClick = (e: any) => {
    const pathname = `/applications/${applicationId}/${e.keyPath.reverse().join('/')}`;
    history.push({
      pathname,
    });

    // update menu key
    setSelectedKeys(e.keyPath);
  };

  return (
    <Layout hasSider style={{ height: '100%' }}>
      <Sider
        theme="light"
        width={250}
        collapsedWidth={60}
        breakpoint="xl"
        onBreakpoint={(broken) => setSiderCollapsed(broken)}
        style={{ height: '100%', overflow: 'auto' }}>
        <AppName style={{ paddingLeft: siderCollapsed ? 8 : 24 }}>{application?.name}</AppName>
        <Menu
          onClick={handleClick}
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={['file', 'settings', 'builder']}
          theme="light">
          <Menu.Item key="overview" icon={<DashboardOutlined />}>
            {global.overview}
          </Menu.Item>
          <Menu.Item key="projects" icon={<ProjectOutlined />}>
            {global.project}
          </Menu.Item>
          <Menu.SubMenu key="file" title={file.name} icon={<FileSearchOutlined />}>
            <Menu.Item key="pages" icon={<FileTextOutlined />}>
              {file.page}
            </Menu.Item>
            <Menu.Item key="templates" icon={<FileOutlined />}>
              {file.template}
            </Menu.Item>
            <Menu.Item key="functions" icon={<FunctionOutlined />}>
              {global.functions}
            </Menu.Item>
            <Menu.Item key="variables" icon={<SlidersOutlined />}>
              {global.variables}
            </Menu.Item>
            <Menu.Item key="conditions" icon={<ControlOutlined />}>
              {global.conditions}
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.Item key="packages" icon={<BookOutlined />}>
            {global.packages}
          </Menu.Item>
          <Menu.Item key="resources" icon={<ContainerOutlined />}>
            {global.resources}
          </Menu.Item>
          <Menu.Item key="dynamics" icon={<BranchesOutlined />}>
            {global.dynamics}
          </Menu.Item>
          <Menu.SubMenu key="settings" title={global.setting} icon={<SettingOutlined />}>
            <Menu.SubMenu key="builder" title={global.builder} icon={<BuildOutlined />}>
              <Menu.Item key="component" icon={<BarsOutlined />}>
                {setting.componentBar}
              </Menu.Item>
              <Menu.Item key="page" icon={<FileTextOutlined />}>
                {file.page}
              </Menu.Item>
              <Menu.Item key="template" icon={<FileOutlined />}>
                {file.template}
              </Menu.Item>
            </Menu.SubMenu>
            <Menu.Item key="application" icon={<AppstoreOutlined />}>
              {global.application}
            </Menu.Item>
          </Menu.SubMenu>
        </Menu>
      </Sider>

      <Switch>
        <Route path="/applications/:applicationId/overview" component={Overview} />
        <Route path="/applications/:applicationId/file" component={File} />
        <Route path="/applications/:applicationId/packages" component={Packages} />
        <Route path="/applications/:applicationId/projects" component={Projects} />
        <Route path="/applications/:applicationId/resources" component={Resources} />
        <Route path="/applications/:applicationId/dynamics" component={Dynamics} />
        <Route path="/applications/:applicationId/settings" component={Settings} />

        <Redirect from="/*" to={`/applications/${applicationId}/file/pages/list`} />
      </Switch>
    </Layout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ApplicationDetail);
