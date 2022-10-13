import React, { useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { Tabs } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/packages/list';
import { GetComponentSearchsProps } from '@/apis/application';
import { Content, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import { AppComponentFetchParams } from '@/types/application';

import { RegisterModal } from '../fast';

import { EditDrawer, List } from './components';

const { TabPane } = Tabs;

const PACKAGES_LENGTH = 8;
const TYPE = {
  editor: 'editor',
  component: 'component',
};

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

  // i18n
  const { locale } = useContext(GlobalContext);
  const { package: packageI18n } = locale.business;

  const location = useLocation();
  const type = useMemo(() => {
    const pathName = location?.pathname || '';
    return (
      pathName &&
      pathName.substring(pathName.indexOf('package/') + PACKAGES_LENGTH, pathName.indexOf('/list') - 1)
    );
  }, [location]);
  const packageType: GetComponentSearchsProps['type'] = (TYPE?.[type] ||
    new URLSearchParams(location.search).get('packageType') ||
    'component') as GetComponentSearchsProps['type'];

  useEffect(() => {
    updateListState({
      selectPackage: '' as AppComponentFetchParams['type'],
      pageInfo: {
        page: 1,
        size: 10,
        total: 0,
      },
    });
  }, []);

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
      pageInfo: {
        page: 1,
        size: 10,
        total: 0,
      },
    });

    if (applicationId) fetchComponentList({ applicationId });
  };

  return (
    <>
      <Content>
        <FoxPageContent
          breadcrumb={
            <FoxPageBreadcrumb
              breadCrumb={[{ name: type === TYPE.editor ? packageI18n.editor : packageI18n.component }]}
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
              {type === TYPE.editor ? (
                <TabPane tab={<span>{packageI18n.editor}</span>} key="editor" />
              ) : (
                <>
                  <TabPane tab={<span>{packageI18n.component}</span>} key="component" />
                  <TabPane tab={<span>{packageI18n.systemComponent}</span>} key="systemComponent" />
                </>
              )}
            </Tabs>
            <List type={type} openQuicklyModal={setRegisterModalState} />
          </>
        </FoxPageContent>
      </Content>
      <EditDrawer />
      <RegisterModal visible={registerModalState} onVisibleChange={setRegisterModalState} />
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Packages);
