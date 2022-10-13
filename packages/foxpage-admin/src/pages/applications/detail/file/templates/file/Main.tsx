import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { Input } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/templates/list';
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
  loading: store.applications.detail.file.templates.list.loading,
  saveLoading: store.applications.detail.file.templates.list.saveLoading,
  list: store.applications.detail.file.templates.list.list,
  pageInfo: store.applications.detail.file.templates.list.pageInfo,
  drawerOpen: store.applications.detail.file.templates.list.drawerOpen,
  editFile: store.applications.detail.file.templates.list.editFile,
  authDrawerOpen: store.applications.detail.file.templates.list.authListDrawerVisible,
  authLoading: store.applications.detail.file.templates.list.authListLoading,
  authList: store.applications.detail.file.templates.list.authList,
  userList: store.applications.detail.file.templates.list.userList,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchTemplateList: ACTIONS.fetchApplicationTemplates,
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

type TemplateListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<TemplateListType> = (props) => {
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
    fetchTemplateList,
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
      fetchTemplateList({ applicationId, page: pageNum, size: pageInfo.size, search });
    }
  }, [applicationId, pageNum, search]);

  const handleSearch = (search) => {
    setPageNum(PAGE_NUM);

    setSearch(search);
  };

  return (
    <React.Fragment>
      <FoxPageContent breadcrumb={<FoxPageBreadcrumb breadCrumb={[{ name: file.template }]} />}>
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
                fetchTemplateList({ applicationId, page, size, search });
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
              fetchFileList={fetchTemplateList}
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
