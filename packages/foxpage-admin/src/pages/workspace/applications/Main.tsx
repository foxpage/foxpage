import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/applications/list';
import { AuthorizeDrawer, Content, FoxPageBreadcrumb, FoxPageContent } from '@/pages/components';
import { GlobalContext } from '@/pages/system';

import { EditDrawer, List } from './components';

const { Search } = Input;

const PAGE_NUM = 1;
const PAGE_SIZE = 999;

const mapStateToProps = (state: RootState) => ({
  pageInfo: state.workspace.applications.list.pageInfo,
  drawerVisible: state.workspace.applications.list.editDrawerVisible,
  editApp: state.workspace.applications.list.editApp,
  authDrawerVisible: state.workspace.applications.list.authListDrawerVisible,
  authLoading: state.workspace.applications.list.authListLoading,
  authList: state.workspace.applications.list.authList,
  userList: state.workspace.applications.list.userList,
});

const mapDispatchToProps = {
  fetchList: ACTIONS.fetchList,
  saveApp: ACTIONS.saveApp,
  openDrawer: ACTIONS.openEditDrawer,
  openAuthDrawer: ACTIONS.updateAuthDrawerVisible,
  fetchAuthList: ACTIONS.fetchAuthList,
  fetchUserList: ACTIONS.fetchUserList,
  saveUser: ACTIONS.saveAuthUser,
  deleteUser: ACTIONS.deleteAuthUser,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

function Application(props: IProps) {
  const {
    pageInfo,
    editApp,
    authDrawerVisible,
    authLoading,
    authList,
    fetchList,
    openDrawer,
    openAuthDrawer,
    fetchAuthList,
    fetchUserList,
    saveUser,
    deleteUser,
  } = props;
  const [pageNum, setPageNum] = useState<number>(pageInfo.page);
  const [search, setSearch] = useState<string | undefined>();
  const [typeId, setTypeId] = useState('');

  // i18n
  const { locale, organizationId } = useContext(GlobalContext);
  const { application, global } = locale.business;

  useEffect(() => {
    fetchList({
      organizationId,
      page: pageNum,
      size: pageInfo.size,
      search: search || '',
      type: 'user',
    });
  }, [fetchList, organizationId, pageNum, search]);

  useEffect(() => {
    const newTypeId = editApp?.id;
    if (newTypeId) setTypeId(newTypeId);
  }, [editApp]);

  // fetch application selected auth list
  useEffect(() => {
    if (authDrawerVisible && typeId) {
      fetchAuthList({
        applicationId: typeId,
        type: 'application',
        typeId,
      });
    }
  }, [authDrawerVisible, typeId, fetchAuthList]);

  // fetch application selected authorize user available list
  useEffect(() => {
    if (authDrawerVisible) {
      fetchUserList({
        page: PAGE_NUM,
        size: PAGE_SIZE,
      });
    }
  }, [authDrawerVisible, fetchUserList]);

  const handleSearch = (search) => {
    setPageNum(PAGE_NUM);

    setSearch(search);
  };

  return (
    <>
      <Content>
        <FoxPageContent
          breadcrumb={
            <FoxPageBreadcrumb
              breadCrumb={[
                {
                  name: application.name,
                },
              ]}
            />
          }>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <Search
              placeholder={global.inputSearchText}
              defaultValue={search}
              onSearch={handleSearch}
              style={{ width: 250, marginRight: 8 }}
            />
            <Button type="primary" onClick={() => openDrawer(true)}>
              <PlusOutlined /> {application.add}
            </Button>
          </div>
          <List search={search} />
        </FoxPageContent>
      </Content>
      <EditDrawer />
      <AuthorizeDrawer
        type="application"
        typeId={typeId}
        applicationId={typeId}
        visible={authDrawerVisible}
        loading={authLoading}
        list={authList}
        onClose={openAuthDrawer}
        onSearch={fetchUserList}
        onFetch={fetchAuthList}
        onAdd={saveUser}
        onDelete={deleteUser}
      />
    </>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Application);
