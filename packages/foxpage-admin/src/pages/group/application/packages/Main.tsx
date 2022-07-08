import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import { CodepenOutlined, FormOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
import { RootState } from 'typesafe-actions';

import { GetComponentSearchsProps } from '@/apis/group/application/packages';
import { FoxpageBreadcrumb, FoxpageDetailContent } from '@/pages/common';
import GlobalContext from '@/pages/GlobalContext';
import * as ACTIONS from '@/store/actions/group/application/packages/list';

import EditDrawer from './EditDrawer';
import { RegisterModal } from './fast';
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

const Packages: React.FC<PackagesProps> = (props) => {
  const [registerModalState, setRegisterModalState] = useState(false);
  const { selectPackage, updateListState, fetchComponentList } = props;
  const { applicationId } = useParams<{ applicationId: string }>();
  const location = useLocation();
  const packageType: GetComponentSearchsProps['type'] = (new URLSearchParams(location.search).get(
    'packageType',
  ) || 'component') as GetComponentSearchsProps['type'];
  const { locale } = useContext(GlobalContext);
  const { global, application, package: packageI18n } = locale.business;
  useEffect(() => {
    updateListState({
      applicationId,
      selectPackage: packageType,
    });
    fetchComponentList({});
  }, []);
  const onChangeSelectedPackage = (val) => {
    updateListState({
      selectPackage: val,
    });
    fetchComponentList({});
  };
  return (
    <>
      <FoxpageDetailContent
        breadcrumb={
          <FoxpageBreadcrumb
            breadCrumb={[
              { name: application.applicationList, link: '/#/workspace/application' },
              { name: global.packages },
            ]}
          />
        }>
        <>
          <Tabs
            destroyInactiveTabPane
            activeKey={selectPackage || packageType}
            onChange={onChangeSelectedPackage}
            type="line">
            <TabPane
              tab={
                <span>
                  <CodepenOutlined />
                  {packageI18n.component}
                </span>
              }
              key="component"
            />
            <TabPane
              tab={
                <span>
                  <FormOutlined />
                  {packageI18n.editor}
                </span>
              }
              key="editor"
            />
          </Tabs>
          <PackageList openQuicklyModal={setRegisterModalState} />
        </>
      </FoxpageDetailContent>

      <EditDrawer />
      <RegisterModal visible={registerModalState} onVisibleChange={setRegisterModalState} />
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Packages);
