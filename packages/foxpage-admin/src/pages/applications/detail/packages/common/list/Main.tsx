import React, { useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { Tabs } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/packages/list';
import { GetComponentSearchsProps } from '@/apis/application';
import { Content, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import { AppComponentFetchParams } from '@/types/index';
import { getLocationIfo } from '@/utils/location-info';

import { RegisterModal } from '../fast';

import { EditDrawer, List } from './components';

const { TabPane } = Tabs;

const PAGE_NUM = 1;
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
  const [pageNum, setPageNum] = useState(PAGE_NUM);
  const [search, setSearch] = useState('');

  // url params
  const history = useHistory();
  const location = useLocation();
  const { page: searchPage, searchText } = getLocationIfo(location);

  // i18n
  const { locale } = useContext(GlobalContext);
  const { package: packageI18n } = locale.business;

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
    setPageNum(searchPage || PAGE_NUM);
  }, [searchPage]);

  useEffect(() => {
    setSearch(searchText || '');
  }, [searchText]);

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
  }, [applicationId]);

  useEffect(() => {
    updateListState({
      search: searchText,
    });
  }, [searchText]);

  useEffect(() => {
    if (applicationId) fetchComponentList({ applicationId, page: pageNum, search });
  }, [applicationId, pageNum, search, selectPackage]);

  const onChangeSelectedPackage = (val) => {
    updateListState({
      selectPackage: val,
      pageInfo: {
        page: 1,
        size: 10,
        total: 0,
      },
    });

    history.push({
      pathname: location.pathname,
      search: `?page=${PAGE_NUM}&searchText=`,
    });
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
