import React, { useCallback, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom';

import { DashboardOutlined, DatabaseOutlined } from '@ant-design/icons';
import { Layout, Menu, Tooltip } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { fetchCollectionList } from '@/actions/data/list';
import { GlobalContext } from '@/pages/system';

import Query from './query';

const { Sider } = Layout;

const DEFAULT_COLLECT = 'fp_application';

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

const mapStateToProps = (store: RootState) => ({
  collections: store.data.list.collections,
});

const mapDispatchToProps = {
  fetchCollectionList: fetchCollectionList,
};

type DataProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Data: React.FC<DataProps> = (props) => {
  const { collections, fetchCollectionList } = props;
  const [selectedKeys, setSelectedKeys] = useState<Array<string>>([DEFAULT_COLLECT]);
  const [siderCollapsed, setSiderCollapsed] = useState(false);

  // route info
  const history = useHistory();
  const location = useLocation();
  const routeMatch = useRouteMatch();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { authorize, data } = locale.business;

  useEffect(() => {
    fetchCollectionList();
  }, []);

  useEffect(() => {
    setSelectedKeys(location.pathname.replace(routeMatch.url, '').replace('/', '').split('/'));
  }, [location]);

  const handleClick = useCallback((e: any) => {
    const pathname = `/${e.keyPath.reverse().join('/')}`;
    history.push({
      pathname,
    });
  }, []);

  const handleBreakPoint = useCallback((broken) => {
    setSiderCollapsed(broken);
  }, []);

  return (
    <Layout hasSider style={{ height: '100%' }}>
      <Sider
        theme="light"
        breakpoint="xxl"
        width={250}
        collapsedWidth={60}
        onBreakpoint={handleBreakPoint}
        style={{ height: '100%' }}>
        <Tooltip title={data.name} placement="right">
          <Location style={{ paddingLeft: siderCollapsed ? 8 : 18 }}>{authorize.admin}</Location>
        </Tooltip>
        <div className="h-full overflow-auto">
          <Menu
            mode="inline"
            theme="light"
            defaultOpenKeys={['data']}
            selectedKeys={selectedKeys}
            onClick={handleClick}>
            <Menu.SubMenu key="data" title={data.awsMongoDB} icon={<DashboardOutlined />}>
              {collections &&
                collections.map((collect) => (
                  <Menu.Item key={collect} icon={<DatabaseOutlined />} style={{ userSelect: 'none' }}>
                    {collect}
                  </Menu.Item>
                ))}
            </Menu.SubMenu>
          </Menu>
        </div>
      </Sider>
      <Switch>
        <Route path="/data/:collect" component={Query} />

        <Redirect from="/*" to={`/data/${DEFAULT_COLLECT}`} />
      </Switch>
    </Layout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Data);
