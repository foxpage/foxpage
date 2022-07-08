import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom';

import {
  BookOutlined,
  BranchesOutlined,
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

import * as ACTIONS from '@/actions/group/application/settings';
import GlobalContext from '@/pages/GlobalContext';
import { ApplicationUrlParams } from '@/types/application';

import Conditions from '../conditions';
import Files from '../files';
import Functions from '../functions';
import Component from '../packages';
import ComponentDetail from '../packages/detail';
import Pages from '../pages';
import PageContents from '../pages/Content';
import Projects from '../projects/Index';
import Resource from '../resource';
import ResourceDetail from '../resource/detail';
import Setting from '../settings';
import Templates from '../templates';
import TemplateContents from '../templates/Content';
import Variables from '../variables';
import Versions from '../versions';

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
  organizationId: store.system.organizationId,
  application: store.group.application.settings.application,
});

const mapDispatchToProps = {
  getAppDetail: ACTIONS.fetchApplicationInfo,
};

type ApplicationDetailProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Detail: React.FC<ApplicationDetailProps> = (props) => {
  const [selectedKeys, setSelectedKeys] = useState<Array<string>>(['files']);
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const history = useHistory();
  const location = useLocation();
  const routeMatch = useRouteMatch();
  const { applicationId } = useParams<ApplicationUrlParams>();
  const { application, getAppDetail, organizationId } = props;

  // multi-language
  const { locale } = useContext(GlobalContext);
  const { global, file } = locale.business;

  useEffect(() => {
    getAppDetail(applicationId);
  }, []);

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
    const pathname = `/organization/${organizationId}/application/${applicationId}/detail/${e.keyPath
      .reverse()
      .join('/')}`;
    console.log('pathname', pathname);
    history.push({
      pathname,
    });
    setSelectedKeys(e.keyPath);
  };
  return (
    <Layout hasSider style={{ height: '100%' }}>
      <Sider
        width={250}
        theme="light"
        breakpoint="xl"
        collapsedWidth={60}
        onBreakpoint={(broken) => setSiderCollapsed(broken)}
        style={{ height: '100%', overflow: 'auto' }}>
        <AppName style={{ paddingLeft: siderCollapsed ? 8 : 24 }}>{application?.name}</AppName>
        <Menu
          onClick={handleClick}
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={['resource', 'file']}
          theme="light">
          <Menu.Item key="dashbroad" icon={<DashboardOutlined />}>
            {global.dashboard}
          </Menu.Item>
          <Menu.Item key="projects" icon={<ProjectOutlined />}>
            {global.project}
          </Menu.Item>
          <Menu.SubMenu key="file" title={file.name} icon={<FileSearchOutlined />}>
            <Menu.Item key="page" icon={<FileTextOutlined />}>
              {file.page}
            </Menu.Item>
            <Menu.Item key="template" icon={<FileOutlined />}>
              {file.template}
            </Menu.Item>
            <Menu.Item key="function" icon={<FunctionOutlined />}>
              {global.functions}
            </Menu.Item>
            <Menu.Item key="variable" icon={<SlidersOutlined />}>
              {global.variables}
            </Menu.Item>
            <Menu.Item key="condition" icon={<ControlOutlined />}>
              {global.conditions}
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.Item key="packages" icon={<BookOutlined />}>
            {global.packages}
          </Menu.Item>
          <Menu.Item key="resource" icon={<ContainerOutlined />}>
            {global.resources}
          </Menu.Item>
          <Menu.Item key="dynamics" icon={<BranchesOutlined />}>
            {global.dynamics}
          </Menu.Item>

          <Menu.Item key="setting" icon={<SettingOutlined />}>
            {global.setting}
          </Menu.Item>
        </Menu>
      </Sider>
      <Switch>
        <Route
          path="/organization/:organizationId/application/:applicationId/detail/page/:fileId/content"
          component={PageContents}
        />
        <Route
          path="/organization/:organizationId/application/:applicationId/detail/file/page"
          component={Pages}
        />
        <Route
          path="/organization/:organizationId/application/:applicationId/detail/file/dynamics"
          component={Versions}
        />
        <Route
          path="/organization/:organizationId/application/:applicationId/detail/dashbroad"
          component={Files}
        />
        <Route
          path="/organization/:organizationId/application/:applicationId/detail/setting"
          component={Setting}
        />
        <Route
          path="/organization/:organizationId/application/:applicationId/detail/template/:fileId/content"
          component={TemplateContents}
        />
        <Route
          path="/organization/:organizationId/application/:applicationId/detail/file/template"
          component={Templates}
        />
        <Route
          path="/organization/:organizationId/application/:applicationId/detail/file/function"
          component={Functions}
        />
        <Route
          path="/organization/:organizationId/application/:applicationId/detail/file/variable"
          component={Variables}
        />
        <Route
          path="/organization/:organizationId/application/:applicationId/detail/file/condition"
          component={Conditions}
        />
        <Route
          path="/organization/:organizationId/application/:applicationId/detail/resource/:resourceRoot"
          component={ResourceDetail}
        />
        <Route
          path="/organization/:organizationId/application/:applicationId/detail/resource"
          component={Resource}
        />
        <Route
          path="/organization/:organizationId/application/:applicationId/detail/packages/:fileId/detail"
          component={ComponentDetail}
        />
        <Route
          path="/organization/:organizationId/application/:applicationId/detail/packages"
          component={Component}
        />
        {/* <Route path="/organization/application/detail/:applicationId/resource/conditions" component={Conditions} />
            <Route path="/organization/application/detail/:applicationId/resource/variables" component={Variables} /> */}
        <Route
          path="/organization/:organizationId/application/:applicationId/detail/projects"
          component={Projects}
        />
        <Redirect
          from={`/organization/${organizationId}/application/${applicationId}/detail`}
          to={`/organization/${organizationId}/application/${applicationId}/detail/file/page`}
        />
      </Switch>
    </Layout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Detail);
