import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom';

import {
  BookOutlined,
  BorderOutlined,
  BranchesOutlined,
  FileOutlined,
  FileTextOutlined,
  ForkOutlined,
  FunctionOutlined,
  LayoutOutlined,
  SettingOutlined,
  SlidersOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/application/settings';
import { ApplicationUrlParams } from '@/types/application';

import Conditions from '../conditions';
import Files from '../files';
import Functions from '../functions';
import Component from '../packages';
import ComponentDetail from '../packages/detail';
import Pages from '../pages';
import PageContents from '../pages/Content';
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

const { Content, Sider } = Layout;

const mapStateToProps = (store: RootState) => ({
  application: store.group.application.settings.application,
});

const mapDispatchToProps = {
  getAppDetail: ACTIONS.fetchApplicationInfo,
};

type ApplicationDetailProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Detail: React.FC<ApplicationDetailProps> = props => {
  const [selectedKeys, setSelectedKeys] = useState<Array<string>>(['files']);
  const history = useHistory();
  const location = useLocation();
  const routeMatch = useRouteMatch();
  const { applicationId, organizationId } = useParams<ApplicationUrlParams>();
  const { application, getAppDetail } = props;
  useEffect(() => {
    getAppDetail(applicationId);
  }, []);

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
    const pathname = `/organization/${organizationId}/application/${applicationId}/detail/${e.keyPath
      .reverse()
      .join('/')}`;
    history.push({
      pathname,
    });
    setSelectedKeys(e.keyPath);
  };
  return (
    <Layout hasSider style={{ height: '100%' }}>
      <Sider width={250} theme="light" style={{ height: '100%', overflow: 'auto' }}>
        <AppName>{application?.name}</AppName>
        <Menu
          onClick={handleClick}
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={['resource']}
          theme="light"
        >
          <Menu.Item key="dashbroad" icon={<BorderOutlined />}>
            Dashbroad
          </Menu.Item>
          <Menu.Item key="page" icon={<FileOutlined />}>
            Page
          </Menu.Item>
          <Menu.Item key="template" icon={<LayoutOutlined />}>
            Template
          </Menu.Item>
          <Menu.Item key="function" icon={<FunctionOutlined />}>
            Function
          </Menu.Item>
          <Menu.Item key="variable" icon={<SlidersOutlined />}>
            Variable
          </Menu.Item>
          <Menu.Item key="condition" icon={<ForkOutlined />}>
            Condition
          </Menu.Item>
          <Menu.Item key="resource" icon={<FileTextOutlined />}>
            Resource
          </Menu.Item>
          <Menu.Item key="packages" icon={<BookOutlined />}>
            Packages
          </Menu.Item>

          <Menu.Item key="dynamics" icon={<BranchesOutlined />}>
            Dynamics
          </Menu.Item>

          <Menu.Item key="setting" icon={<SettingOutlined />}>
            Setting
          </Menu.Item>
          {/* <SubMenu key="resource" title="Resource">
              <Menu.Item key="packages">Packages</Menu.Item>
              <Menu.Item key="variables">Variables</Menu.Item>
              <Menu.Item key="conditions">Option Conditions</Menu.Item>
            </SubMenu> */}
        </Menu>
      </Sider>
      <Content style={{ padding: '24px', minHeight: 280, height: '100%', overflow: 'scroll' }}>
        <Switch>
          <Route
            path="/organization/:organizationId/application/:applicationId/detail/page/:fileId/content"
            component={PageContents}
          />
          <Route path="/organization/:organizationId/application/:applicationId/detail/page" component={Pages} />
          <Route path="/organization/:organizationId/application/:applicationId/detail/dynamics" component={Versions} />
          <Route path="/organization/:organizationId/application/:applicationId/detail/dashbroad" component={Files} />
          <Route path="/organization/:organizationId/application/:applicationId/detail/setting" component={Setting} />
          <Route
            path="/organization/:organizationId/application/:applicationId/detail/template/:fileId/content"
            component={TemplateContents}
          />
          <Route
            path="/organization/:organizationId/application/:applicationId/detail/template"
            component={Templates}
          />
          <Route
            path="/organization/:organizationId/application/:applicationId/detail/function"
            component={Functions}
          />
          <Route
            path="/organization/:organizationId/application/:applicationId/detail/variable"
            component={Variables}
          />
          <Route
            path="/organization/:organizationId/application/:applicationId/detail/condition"
            component={Conditions}
          />
          <Route
            path="/organization/:organizationId/application/:applicationId/detail/resource/:resourceRoot"
            component={ResourceDetail}
          />
          <Route path="/organization/:organizationId/application/:applicationId/detail/resource" component={Resource} />
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
          <Redirect
            from={`/organization/${organizationId}/application/${applicationId}/detail`}
            to={`/organization/${organizationId}/application/${applicationId}/detail/page`}
          />
        </Switch>
      </Content>
    </Layout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Detail);
