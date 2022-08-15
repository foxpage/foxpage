import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { Tabs } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/packages/list';
import { GetComponentSearchsProps } from '@/apis/application';
import { Content, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { GlobalContext } from '@/pages/system';

import { RegisterModal } from '../fast';

import { EditDrawer, List } from './components';

const { TabPane } = Tabs;

const mapStateToProps = (store: RootState) => ({
  applicationId: store.applications.detail.settings.app.applicationId,
  selectPackage: store.applications.detail.packages.list.selectPackage,
});

const mapDispatchToProps = {
  updateListState: ACTIONS.updateListState,
  fetchComponentList: ACTIONS.fetchComponentsAction,
};

type PackagesProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Packages: React.FC<PackagesProps> = (props) => {
  const { applicationId, selectPackage, updateListState, fetchComponentList } = props;
  const [registerModalState, setRegisterModalState] = useState(false);

  const location = useLocation();
  const packageType: GetComponentSearchsProps['type'] = (new URLSearchParams(location.search).get(
    'packageType',
  ) || 'component') as GetComponentSearchsProps['type'];

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, application, package: packageI18n } = locale.business;

  useEffect(() => {
    updateListState({
      applicationId,
      selectPackage: packageType,
    });

    if (applicationId) fetchComponentList({ applicationId });
  }, [applicationId]);

  const onChangeSelectedPackage = (val) => {
    updateListState({
      selectPackage: val,
    });

    if (applicationId) fetchComponentList({ applicationId });
  };

  return (
    <>
      <Content>
        <FoxPageContent
          breadcrumb={
            <FoxPageBreadcrumb
              breadCrumb={[
                { name: application.applicationList, link: '/#/workspace/applications' },
                { name: global.packages },
              ]}
            />
          }
          style={{
            overflow: 'hidden auto',
          }}>
          <>
            <Tabs
              destroyInactiveTabPane
              activeKey={selectPackage || packageType}
              onChange={onChangeSelectedPackage}
              type="line">
              <TabPane tab={<span>{packageI18n.component}</span>} key="component" />
              <TabPane tab={<span>{packageI18n.editor}</span>} key="editor" />
              <TabPane tab={<span>{packageI18n.systemComponent}</span>} key="systemComponent" />
            </Tabs>
            <List openQuicklyModal={setRegisterModalState} />
          </>
        </FoxPageContent>
      </Content>
      <EditDrawer />
      <RegisterModal visible={registerModalState} onVisibleChange={setRegisterModalState} />
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Packages);
