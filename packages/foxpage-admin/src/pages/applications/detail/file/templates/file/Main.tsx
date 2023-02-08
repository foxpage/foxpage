import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Input } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/templates/list';
import { FileScopeSelector, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import { getLocationIfo } from '@/utils/location-info';

import { List } from './components/index';

const { Search } = Input;

const PAGE_NUM = 1;

const OptionsBox = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
`;

const mapStateToProps = (store: RootState) => ({
  applicationId: store.applications.detail.settings.app.applicationId,
  loading: store.applications.detail.file.templates.list.loading,
  saveLoading: store.applications.detail.file.templates.list.saveLoading,
  list: store.applications.detail.file.templates.list.list,
  pageInfo: store.applications.detail.file.templates.list.pageInfo,
  drawerOpen: store.applications.detail.file.templates.list.drawerOpen,
  editFile: store.applications.detail.file.templates.list.editFile,
  authDrawerOpen: store.applications.detail.file.templates.list.authListDrawerVisible,
  authLoading: store.applications.detail.file.templates.list.authListLoading,
  authList: store.applications.detail.file.templates.list.authList,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchTemplateList: ACTIONS.fetchApplicationTemplates,
  openDrawer: ACTIONS.openEditDrawer,
  saveFile: ACTIONS.saveFile,
  updateEditFile: ACTIONS.updateEditFileValue,
  openAuthDrawer: ACTIONS.updateAuthDrawerVisible,
  fetchAuthList: ACTIONS.fetchAuthList,
  deleteUser: ACTIONS.deleteAuthUser,
  saveUser: ACTIONS.saveAuthUser,
  fetchUserList: ACTIONS.fetchUserList,
};

type TemplateListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<TemplateListType> = (props) => {
  const { applicationId, loading, list, pageInfo, fetchTemplateList, clearAll } = props;
  const [pageNum, setPageNum] = useState<number>(pageInfo.page);

  // url search params
  const history = useHistory();
  const { page: searchPage, searchText } = getLocationIfo(history.location);

  const [search, setSearch] = useState<string | undefined>(searchText);

  // i18n
  const { locale } = useContext(GlobalContext);
  const { file, global } = locale.business;

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
      fetchTemplateList({ applicationId, page: pageNum, size: pageInfo.size, search });
    }
  }, [applicationId, pageNum, search]);

  const handleSearch = (search) => {
    history.push({
      pathname: history.location.pathname,
      search: `?page=${PAGE_NUM}&searchText=${search}`,
    });
  };

  const handlePaginationChange = (page) => {
    history.push({
      pathname: history.location.pathname,
      search: `?page=${page}&searchText=${search || ''}`,
    });
  };

  return (
    <React.Fragment>
      <FoxPageContent breadcrumb={<FoxPageBreadcrumb breadCrumb={[{ name: file.template }]} />}>
        <OptionsBox>
          <div style={{ flex: '0 0 200px' }}>
            <FileScopeSelector scope="project" disabled={['application']} />
          </div>
          <div style={{ flexGrow: 1, textAlign: 'right' }}>
            <Search
              placeholder={global.inputSearchText}
              defaultValue={search}
              onSearch={handleSearch}
              style={{ width: 250 }}
            />
          </div>
        </OptionsBox>
        {applicationId && (
          <List
            applicationId={applicationId}
            loading={loading}
            pageInfo={pageInfo}
            list={list}
            onPaginationChange={handlePaginationChange}
          />
        )}
      </FoxPageContent>
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
