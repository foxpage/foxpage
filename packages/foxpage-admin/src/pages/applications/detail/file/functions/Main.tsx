import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/functions';
import { FileScopeSelector, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { GlobalContext } from '@/pages/system';

import { EditDrawer, List } from './components';

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

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, function: func } = locale.business;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  useEffect(() => {
    if (applicationId) {
      fetchList({
        applicationId,
        page: pageNum,
        size: pageInfo.size,
        search: search || '',
      });
    }
  }, [applicationId, pageNum, scope, search]);

  const handleSearch = (search) => {
    setPageNum(PAGE_NUM);

    setSearch(search);
  };

  return (
    <>
      <FoxPageContent breadcrumb={<FoxPageBreadcrumb breadCrumb={[{ name: global.functions }]} />}>
        <OptionsBox>
          <div style={{ flex: '0 0 200px' }}>
            <FileScopeSelector onChange={updateScope} />
          </div>
          <div style={{ flexGrow: 1, textAlign: 'right' }}>
            <Search
              placeholder={global.inputSearchText}
              defaultValue={search}
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
