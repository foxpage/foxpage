import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/functions';
import { FileScopeSelector, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { GlobalContext } from '@/pages/system';

import { EditDrawer, List } from './components';
import { getLocationIfo } from '@/utils/location-info';

const { Search } = Input;

const PAGE_NUM = 1;

const OptionsBox = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
`;

const mapStateToProps = (store: RootState) => ({
  applicationId: store.applications.detail.settings.app.applicationId,
  pageInfo: store.applications.detail.file.functions.pageInfo,
  scope: store.applications.detail.file.functions.scope,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchList: ACTIONS.fetchList,
  openEditDrawer: ACTIONS.openEditDrawer,
  updateScope: ACTIONS.updateScope,
};

type FunctionType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<FunctionType> = (props) => {
  const { applicationId, pageInfo, scope, clearAll, fetchList, openEditDrawer, updateScope } = props;
  const [pageNum, setPageNum] = useState<number>(pageInfo.page);
  const [search, setSearch] = useState<string | undefined>();

  // url params
  const history = useHistory();
  const { page: searchPage, searchText } = getLocationIfo(history.location);

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, function: func } = locale.business;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  useEffect(() => {
    setPageNum(searchPage || PAGE_NUM);
  }, [searchPage]);

  useEffect(() => {
    setSearch(searchText || '');
  }, [searchText]);

  useEffect(() => {
    if (applicationId) {
      fetchList({
        applicationId,
        page: pageNum,
        size: pageInfo.size,
        search: searchText || '',
      });
    }
  }, [applicationId, pageNum, scope, searchText]);

  const handleScopeChange = (scope) => {
    updateScope(scope);

    history.push({
      pathname: history.location.pathname,
      search: `?page=${PAGE_NUM}&searchText=`,
    });
  };

  const handleSearch = (search) => {
    history.push({
      pathname: history.location.pathname,
      search: `?page=${PAGE_NUM}&searchText=${search}`,
    });
  };

  return (
    <>
      <FoxPageContent breadcrumb={<FoxPageBreadcrumb breadCrumb={[{ name: global.functions }]} />}>
        <OptionsBox>
          <div style={{ flex: '0 0 200px' }}>
            <FileScopeSelector onChange={handleScopeChange} />
          </div>
          <div style={{ flexGrow: 1, textAlign: 'right' }}>
            <Search
              placeholder={global.inputSearchText}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSearch={handleSearch}
              style={{ width: 250, marginRight: 12 }}
            />
            {scope === 'application' && (
              <Button type="primary" onClick={() => openEditDrawer(true)}>
                <PlusOutlined /> {func.add}
              </Button>
            )}
          </div>
        </OptionsBox>
        <List search={search} />
      </FoxPageContent>
      <EditDrawer applicationId={applicationId} search={search} />
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
