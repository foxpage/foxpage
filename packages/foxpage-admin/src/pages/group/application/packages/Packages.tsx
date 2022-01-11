import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import { CodepenOutlined, FormOutlined, ImportOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
import { RootState } from 'typesafe-actions';

import { GetComponentSearchsProps } from '@/apis/group/application/packages';
import { FoxpageBreadcrumb } from '@/pages/common';
import * as ACTIONS from '@/store/actions/group/application/packages/list';

import EditDrawer from './EditDrawer';
import PackageList from './PackageList';

const { TabPane } = Tabs;

const mapStateToProps = (store: RootState) => ({
  selectPackage: store.group.application.packages.list.selectPackage,
});

const mapDispatchToProps = {
  updateListState: ACTIONS.updateListState,
  fetchComponentList: ACTIONS.fetchComponentsAction,
};

type PackagesProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Packages: React.FC<PackagesProps> = props => {
  const { selectPackage, updateListState, fetchComponentList } = props;
  const { applicationId, organizationId } = useParams<{ applicationId: string; organizationId: string }>();
  const location = useLocation();
  const packageType: GetComponentSearchsProps['type'] = (new URLSearchParams(location.search).get('packageType') ||
    'component') as GetComponentSearchsProps['type'];
  useEffect(() => {
    updateListState({
      applicationId,
      selectPackage: packageType,
    });
    fetchComponentList({});
  }, []);
  const onChangeSelectedPackage = val => {
    updateListState({
      selectPackage: val,
    });
    fetchComponentList({});
  };
  return (
    <div>
      <FoxpageBreadcrumb
        breadCrumb={[
          { name: 'Application List', link: `/#/organization/${organizationId}/application/list` },
          { name: 'Packages' },
        ]}
      />
      <Tabs
        destroyInactiveTabPane
        activeKey={selectPackage || packageType}
        onChange={onChangeSelectedPackage}
        type="line"
      >
        <TabPane
          tab={
            <span>
              <CodepenOutlined />
              Component
            </span>
          }
          key="component"
        />
        <TabPane
          tab={
            <span>
              <FormOutlined />
              Editor
            </span>
          }
          key="editor"
        />
        <TabPane
          tab={
            <span>
              <ImportOutlined />
              Library
            </span>
          }
          key="library"
        />
      </Tabs>
      <PackageList />
      <EditDrawer />
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Packages);
