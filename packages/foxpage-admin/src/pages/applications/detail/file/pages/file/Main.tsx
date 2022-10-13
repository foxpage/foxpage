import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { Input } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/pages/list';
import { AuthorizeDrawer, FileScopeSelector, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { GlobalContext } from '@/pages/system';

import { FileEditDrawer } from '../../components';

import { List } from './components/index';

const { Search } = Input;

const PAGE_NUM = 1;
const PAGE_SIZE = 999;

const OptionsBox = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
`;

const mapStateToProps = (store: RootState) => ({
  applicationId: store.applications.detail.settings.app.applicationId,
  loading: store.applications.detail.file.pages.list.loading,
  saveLoading: store.applications.detail.file.pages.list.saveLoading,
  list: store.applications.detail.file.pages.list.list,
  pageInfo: store.applications.detail.file.pages.list.pageInfo,
  drawerOpen: store.applications.detail.file.pages.list.drawerOpen,
  editFile: store.applications.detail.file.pages.list.editFile,
  authDrawerOpen: store.applications.detail.file.pages.list.authListDrawerVisible,
  authLoading: store.applications.detail.file.pages.list.authListLoading,
  authList: store.applications.detail.file.pages.list.authList,
  userList: store.applications.detail.file.pages.list.userList,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchPageList: ACTIONS.fetchApplicationPages,
  deleteFile: ACTIONS.deleteFile,
  openDrawer: ACTIONS.openEditDrawer,
  saveFile: ACTIONS.saveFile,
  updateEditFile: ACTIONS.updateEditFileValue,
  openAuthDrawer: ACTIONS.updateAuthDrawerVisible,
  fetchAuthList: ACTIONS.fetchAuthList,
  deleteUser: ACTIONS.deleteAuthUser,
  saveUser: ACTIONS.saveAuthUser,
  fetchUserList: ACTIONS.fetchUserList,
};

type PageListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<PageListType> = (props) => {
  const {
    applicationId,
    loading,
    list,
    pageInfo,
    drawerOpen,
    saveLoading,
    editFile,
    authDrawerOpen,
    authLoading,
    authList,
    userList,
    fetchPageList,
    clearAll,
    deleteFile,
    openDrawer,
    saveFile,
    updateEditFile,
    openAuthDrawer,
    fetchAuthList,
    deleteUser,
    saveUser,
    fetchUserList,
  } = props;
  const [pageNum, setPageNum] = useState<number>(pageInfo.page);
  const [search, setSearch] = useState<string | undefined>();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { file, global } = locale.business;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  useEffect(() => {
    if (authDrawerOpen) {
      fetchUserList({
        page: PAGE_NUM,
        size: PAGE_SIZE,
      });
    }
  }, [authDrawerOpen]);

  useEffect(() => {
    if (applicationId) {
      fetchPageList({ applicationId, page: pageNum, size: pageInfo.size, search });
    }
  }, [applicationId, pageNum, search]);

  const handleSearch = (search) => {
    setPageNum(PAGE_NUM);

    setSearch(search);
  };

  return (
    <React.Fragment>
      <FoxPageContent breadcrumb={<FoxPageBreadcrumb breadCrumb={[{ name: file.page }]} />}>
        <OptionsBox>
          <div style={{ flex: '0 0 200px' }}>
            <FileScopeSelector scope="project" disabled={['application']} />
          </div>
          <div style={{ flexGrow: 1, textAlign: 'right' }}>
            <Search placeholder={global.inputSearchText} onSearch={handleSearch} style={{ width: 250 }} />
          </div>
        </OptionsBox>
        {applicationId && (
          <>
            <List
              applicationId={applicationId}
              loading={loading}
              pageInfo={pageInfo}
              list={list}
              deleteFile={deleteFile}
              onPaginationChange={(page, size) => {
                fetchPageList({ applicationId, page, size, search });
              }}
              openAuthDrawer={openAuthDrawer}
              openDrawer={openDrawer}
            />
            <FileEditDrawer
              drawerOpen={drawerOpen}
              saveLoading={saveLoading}
              pageInfo={pageInfo}
              editFile={editFile}
              updateEditFile={updateEditFile}
              saveFile={saveFile}
              fetchFileList={fetchPageList}
              closeDrawer={openDrawer}
            />
            <AuthorizeDrawer
              needFetch
              type="file"
              typeId={editFile?.id}
              applicationId={applicationId as string}
              visible={authDrawerOpen}
              loading={authLoading}
              list={authList}
              users={userList}
              onClose={openAuthDrawer}
              onFetch={fetchAuthList}
              onAdd={saveUser}
              onDelete={deleteUser}
            />
          </>
        )}
      </FoxPageContent>
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
